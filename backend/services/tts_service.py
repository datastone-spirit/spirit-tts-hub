import os
import importlib
import logging
import json
import uuid
from datetime import datetime
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, field
from flask import current_app

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 进程级全局 TTS 实例，确保只初始化一次并保持显存常驻
_GLOBAL_TTS_INSTANCE = None

# =========================
# 历史记录保存/查询工具函数
# =========================

# 历史记录目录（统一定义）
_BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))
# 根据运行环境决定历史记录目录：
# - development: 保持现状，使用 backend/history/synthesize
# - production: 将 _BACKEND_DIR 替换为 /root，即 /root/history/synthesize
_ENV_NAME = (os.getenv('FLASK_ENV') or os.getenv('FLASK_CONFIG') or 'development').lower()
if _ENV_NAME == 'production':
    _HISTORY_DIR = os.path.join('/root', 'history', 'synthesize')
else:
    _HISTORY_DIR = os.path.join(_BACKEND_DIR, 'history', 'synthesize')



def query_synthesis_history(start: Optional[str] = None,
                            end: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    查询合成历史记录，可根据时间范围筛选。

    Args:
        start: 开始时间（Unix时间戳字符串）
        end: 结束时间（Unix时间戳字符串）

    Returns:
        List[Dict]: 满足条件的历史记录列表（按时间降序）
    """
    if not os.path.isdir(_HISTORY_DIR):
        return []

    records: List[Dict[str, Any]] = []
    for name in os.listdir(_HISTORY_DIR):
        # 只处理 spk_*.json 形式的文件
        if not name.startswith('spk_') or not name.endswith('.json'):
            continue

        # 提取文件名中的时间戳部分
        try:
            ts_str = name[4:-5]  # 去掉前缀 "spk_" 和后缀 ".json"
            file_ts = int(ts_str)
        except ValueError:
            continue

        # 根据 start/end 过滤
        if start is not None and file_ts < int(start):
            continue
        if end is not None and file_ts > int(end):
            continue

        # 读取并加载 JSON 内容
        path = os.path.join(_HISTORY_DIR, name)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                rec = json.load(f)
        except Exception:
            continue

        # 记录文件系统上的修改时间（作为排序依据，最新优先）
        try:
            rec['_fs_mtime'] = os.path.getmtime(path)
        except Exception:
            pass

        records.append(rec)

    # 按文件名中的时间戳降序排序，最新记录在前
    def _key(r: Dict[str, Any]):
        # 优先使用文件系统修改时间（创建/写入时刻）
        try:
            mtime = r.get('_fs_mtime')
            if mtime is not None:
                return float(mtime)
        except Exception:
            pass

        # 回退：从 id 或 history_path 中解析时间戳
        fname = r.get('id', '')
        if fname.startswith('spk_'):
            try:
                core = fname[4:]
                if '.' in core:
                    core = core.split('.')[0]
                return int(core)
            except ValueError:
                pass
        hpath = r.get('history_path', '')
        if hpath:
            bname = os.path.basename(hpath)
            if bname.startswith('spk_') and bname.endswith('.json'):
                try:
                    return int(bname[4:-5])
                except ValueError:
                    pass
        return 0

    return sorted(records, key=_key, reverse=True)


# =========================
# TTS 服务类
# =========================

class TtsService:
    """TTS 服务类，负责管理 TTS 实例和相关业务逻辑"""
    
    def __init__(self):
        self._tts_instance = None
        self.base_dir = os.path.dirname(os.path.dirname(__file__))  # backend/
        
    def _as_bool(self, val, default=False):
        """将值转换为布尔值"""
        if val is None:
            return default
        if isinstance(val, bool):
            return val
        return str(val).lower() == 'true'

    def _offline_precheck(self, cache_path: str) -> None:
        """
        在严格离线模式下，初始化前检查必须的 HuggingFace 缓存文件是否存在。
        若缺失，抛出明确错误，避免进入任何可能的联网分支。

        Checks:
        - amphion/MaskGCT: semantic_codec/model.safetensors
        - funasr/campplus: campplus_cn_common.bin
        - facebook/w2v-bert-2.0: 预处理配置（preprocessor_config.json 或 config.json）
        """
        try:
            missing: list[str] = []

            def _exists_in_snapshots(root: str, rel_parts: list[str]) -> bool:
                snaps = os.path.join(root, 'snapshots')
                if not os.path.isdir(snaps):
                    return False
                for rev in os.listdir(snaps):
                    cand = os.path.join(snaps, rev, *rel_parts)
                    if os.path.exists(cand):
                        return True
                return False

            # amphion/MaskGCT
            maskgct_root = os.path.join(cache_path, 'models--amphion--MaskGCT')
            if not _exists_in_snapshots(maskgct_root, ['semantic_codec', 'model.safetensors']):
                missing.append('amphion/MaskGCT: semantic_codec/model.safetensors')

            # funasr/campplus
            campplus_root = os.path.join(cache_path, 'models--funasr--campplus')
            if not _exists_in_snapshots(campplus_root, ['campplus_cn_common.bin']):
                missing.append('funasr/campplus: campplus_cn_common.bin')

            # facebook/w2v-bert-2.0（特征提取器需要预处理配置）
            w2v_root = os.path.join(cache_path, 'models--facebook--w2v-bert-2.0')
            has_w2v = (
                _exists_in_snapshots(w2v_root, ['preprocessor_config.json']) or
                _exists_in_snapshots(w2v_root, ['config.json'])
            )
            if not has_w2v:
                missing.append('facebook/w2v-bert-2.0: preprocessor_config.json 或 config.json')

            if missing:
                raise RuntimeError(
                    '离线缓存缺失，无法初始化 TTS。请先在联网环境预取后复制缓存：\n- ' + '\n- '.join(missing)
                )
        except Exception as e:
            # 若预检过程本身异常，抛出明确错误以避免继续初始化
            raise RuntimeError(f'离线预检失败: {str(e)}')
    
    def get_tts(self):
        """获取 TTS 实例（懒加载）"""
        global _GLOBAL_TTS_INSTANCE
        if _GLOBAL_TTS_INSTANCE is None:
            # 强制离线与本地缓存，仅在首次初始化前设置
            try:
                # 统一并强制离线开关（infer_v2.py 会读取这些环境变量）
                os.environ["HF_LOCAL_ONLY"] = os.getenv("HF_LOCAL_ONLY", "1")
                os.environ["HF_HUB_OFFLINE"] = os.getenv("HF_HUB_OFFLINE", "1")
                os.environ["TRANSFORMERS_OFFLINE"] = os.getenv("TRANSFORMERS_OFFLINE", "1")

                # 统一 HuggingFace/Transformers 缓存目录到同一个路径
                cache_val = (
                    current_app.config.get("HF_HUB_CACHE")
                    or current_app.config.get("HUGGINGFACE_HUB_CACHE")
                    or current_app.config.get("HF_HOME")
                    or current_app.config.get("TRANSFORMERS_CACHE")
                )
                if cache_val:
                    cache_path = cache_val if os.path.isabs(cache_val) else os.path.abspath(os.path.join(self.base_dir, cache_val))
                else:
                    # 回退到默认缓存目录
                    cache_path = os.path.abspath(os.path.join(self.base_dir, 'checkpoints', 'hf_cache'))
                os.environ["HF_HUB_CACHE"] = cache_path
                os.environ["HUGGINGFACE_HUB_CACHE"] = cache_path
                os.environ["HF_HOME"] = cache_path
                os.environ["TRANSFORMERS_CACHE"] = cache_path

                # 取消可能存在的镜像端点，避免任何线上尝试
                if os.getenv("HF_ENDPOINT"):
                    os.environ.pop("HF_ENDPOINT", None)

                # 初始化前进行严格离线预检，避免触发任何网络请求
                logger.info(f"[TTS] Offline precheck in cache: {cache_path}")
                self._offline_precheck(cache_path)
            except Exception:
                pass

            from indextts.infer_v2 import IndexTTS2
            
            # 解析模型目录：优先使用环境/配置的 INDEX_TTS_MODEL_DIR；否则使用 DEFAULT_TTS_MODEL；再否则使用默认相对路径
            cfg_val = (
                current_app.config.get('INDEX_TTS_MODEL_DIR')
                or current_app.config.get('DEFAULT_TTS_MODEL')
                or 'index-tts/checkpoints'
            )
            # 将相对路径解析为相对于 backend 目录的绝对路径，确保 model_dir 与 cfg_path 一致
            model_dir_path = cfg_val if os.path.isabs(cfg_val) else os.path.abspath(os.path.join(self.base_dir, cfg_val))

            device_val = (
                current_app.config.get('INDEX_TTS_DEVICE')
                or os.getenv('INDEX_TTS_DEVICE')
                or 'cuda:0'
            )

            _GLOBAL_TTS_INSTANCE = IndexTTS2(
                model_dir=model_dir_path,
                cfg_path=os.path.join(model_dir_path, 'config.yaml'),
                device=device_val,
                use_fp16=self._as_bool(current_app.config.get('INDEX_TTS_FP16'), False),
                use_deepspeed=self._as_bool(current_app.config.get('INDEX_TTS_DEEPSPEED'), False),
                use_cuda_kernel=self._as_bool(current_app.config.get('INDEX_TTS_CUDA_KERNEL'), False),
            )
            try:
                _ = getattr(_GLOBAL_TTS_INSTANCE, 'vocoder', None)
            except Exception:
                pass

        self._tts_instance = _GLOBAL_TTS_INSTANCE
        return _GLOBAL_TTS_INSTANCE

    def ensure_tts_preloaded(self, app) -> None:
        """在应用启动阶段预加载全局 TTS（同进程，保持显存常驻）。"""
        try:
            with app.app_context():
                self.get_tts()
            logger.info("[TTS] Preloaded on startup; GPU memory will remain resident.")
        except Exception as e:
            logger.warning(f"[TTS] Preload failed: {e}")
    
    def synthesize_speech(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        执行语音合成
        
        Args:
            data: 包含合成参数的字典
            
        Returns:
            Dict: 包含结果信息的字典，格式为 {"success": bool, "data": dict, "message": str, "code": int}
        """
        try:
            if not data or 'text' not in data:
                return {"success": False, "message": "Missing required parameter: text", "code": 400}

            _tts = self.get_tts()
            text = data['text']
            
            # 生成唯一文件名
            filename = f"spk_{int(datetime.now().timestamp())}.wav"
            output_path = data.get('output_path') or 'outputs'
            output_path = os.path.join(self.base_dir, output_path, filename)
            # 若目录不存在则创建
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # 文本分段最大 token
            max_tokens_per_segment = data.get('max_tokens_per_segment', 120)

            # 随机情绪采样
            emo_random = data.get('emo_random', False)

            spk_audio_prompt = data.get('spk_audio_prompt', '').strip()
            if not spk_audio_prompt:
                return {"success": False, "message": "Missing required parameter: spk_audio_prompt", "code": 400}
            
            # 检查说话人音频文件是否存在
            if not os.path.isabs(spk_audio_prompt):
                spk_audio_prompt = os.path.join(self.base_dir, 'examples', spk_audio_prompt)
            
            if not os.path.exists(spk_audio_prompt):
                return {"success": False, "message": f"Speaker audio file not found: {spk_audio_prompt}", "code": 404}
            
            # 情感控制映射
            emo_control_method = str(data.get('emo_control_method', 0))
            emo_audio_prompt = data.get('emo_ref_path') or None
            emo_alpha = float(data.get('emo_weight', 0.8))

            if type(emo_control_method) is not int:
                emo_control_method = int(emo_control_method)
            if emo_control_method == 0:  # emotion from speaker
                emo_audio_prompt = None  # remove external reference audio
            if emo_control_method == 1:  # emotion from reference audio
                pass
            if emo_control_method == 2:  # emotion from custom vectors
                vec = [
                    data.get('vec1', 0),
                    data.get('vec2', 0),
                    data.get('vec3', 0),
                    data.get('vec4', 0),
                    data.get('vec5', 0),
                    data.get('vec6', 0),
                    data.get('vec7', 0),
                    data.get('vec8', 0),
                ]
                vec = _tts.normalize_emo_vec(vec, apply_bias=True)
            else:
                # don't use the emotion vector inputs for the other modes
                vec = None

            # 文本情感描述
            emo_text = data.get('prompt') or None
            use_emo_text = emo_control_method==3

            # 采样与生成参数
            kwargs = {
                "do_sample": bool(data.get('do_sample', False)),
                "top_p": float(data.get('top_p', 0.9)),
                "top_k": int(data.get('top_k', 0)) if int(data.get('top_k', 0)) > 0 else None,
                "temperature": float(data.get('temperature', 0.8)),
                "length_penalty": float(data.get('length_penalty', 1.0)),
                "num_beams": int(data.get('num_beams', 1)),
                "repetition_penalty": float(data.get('repetition_penalty', 1.0)),
                "max_mel_tokens": int(data.get('max_mel_tokens', 320)),
            }

            # 执行合成
            infer_result = _tts.infer(
                spk_audio_prompt=spk_audio_prompt,
                text=text,
                emo_text=emo_text,
                output_path=output_path,
                emo_audio_prompt=emo_audio_prompt,
                emo_alpha=emo_alpha,
                emo_vector=vec,
                use_emo_text=use_emo_text,
                use_random=emo_random,
                verbose=bool(data.get('verbose', False)),
                max_text_tokens_per_segment=max_tokens_per_segment,
                **kwargs
            )
            
            # 生成历史记录（保存原始与转换后的配置）
            record_id = os.path.splitext(filename)[0]
            try:
                self.save_synthesis_history(
                    record_id=record_id,
                    input_config_raw=data.get("raw_data"),
                    status=("success" if isinstance(infer_result, str) else "error"),
                    filepath=output_path
                )
            except Exception:
                # 历史记录写入失败不影响主流程
                pass

            # infer 在非流式模式下返回保存的文件路径
            if isinstance(infer_result, str) and os.path.basename(infer_result) == filename:
                return {
                    "success": True,
                    "data": {"audio_path": output_path},
                    "message": "Speech synthesized successfully",
                    "code": 200
                }
            else:
                # 失败也记录一份错误状态的历史记录（已在上方写入）
                return {"success": False, "message": "Synthesis failed", "code": 500}
        
        except Exception as e:
            logger.error(f"Error in synthesize_speech: {str(e)}")
            return {"success": False, "message": str(e), "code": 500}
    
    def parse_tokens(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        文本分段与预览
        
        Args:
            data: 包含文本和分段参数的字典
            
        Returns:
            Dict: 包含分段结果的字典
        """
        try:
            if not data or 'text' not in data:
                return {"success": False, "message": "Missing required parameter: text", "code": 400}
            
            text = data['text']
            max_text_tokens_per_segment = data.get('max_text_tokens_per_segment', 120)
            
            # 如果文本为空直接返回空结果
            if not text or len(text) == 0:
                return {
                    "success": True,
                    "data": {"segments": []},
                    "message": "Text segmented successfully",
                    "code": 200
                }
            
            # 调用分词器进行分段（确保在应用上下文中获取 TTS 实例）
            _tts = self.get_tts()
            text_tokens_list = _tts.tokenizer.tokenize(text)
            segments = _tts.tokenizer.split_segments(
                text_tokens_list,
                max_text_tokens_per_segment=int(max_text_tokens_per_segment)
            )
            
            # 组装返回数据
            result = []
            for idx, seg_tokens in enumerate(segments):
                segment_str = ''.join(seg_tokens)
                token_count = len(seg_tokens)
                result.append({
                    "index": idx,
                    "content": segment_str,
                    "token_count": token_count
                })
            
            return {
                "success": True,
                "data": {"segments": result},
                "message": "Text segmented successfully",
                "code": 200
            }
        
        except Exception as e:
            logger.error(f"Error in parse_tokens: {str(e)}")
            return {"success": False, "message": str(e), "code": 500}
    
    def get_synthesis_history(self, start_ms: Optional[str] = None, end_ms: Optional[str] = None) -> Dict[str, Any]:
        """
        查看合成历史记录，支持按时间筛选（时间参数为毫秒级时间戳）
        
        Args:
            start_ms: 开始时间（毫秒级时间戳字符串）
            end_ms: 结束时间（毫秒级时间戳字符串）
            
        Returns:
            Dict: 包含历史记录的字典
        """
        try:
            start = float(start_ms) / 1000 if start_ms else None
            end = float(end_ms) / 1000 if end_ms else None
            records = query_synthesis_history(start=start, end=end)
            return {
                "success": True,
                "data": {"records": records, "total": len(records)},
                "message": "History queried successfully",
                "code": 200
            }
        except Exception as e:
            logger.error(f"Error in get_synthesis_history: {str(e)}")
            return {"success": False, "message": str(e), "code": 500}
    
    def delete_synthesis_history(self, all_flag: Optional[str] = None, path_param: Optional[str] = None) -> Dict[str, Any]:
        """
        删除历史记录
        
        Args:
            all_flag: 是否删除所有记录的标志
            path_param: 要删除的特定文件路径
            
        Returns:
            Dict: 删除结果
        """
        try:
            delete_all = self._as_bool(all_flag, False)
            history_dir = _HISTORY_DIR
            os.makedirs(history_dir, exist_ok=True)

            deleted = []

            if delete_all:
                for name in os.listdir(history_dir):
                    if name.endswith('.json'):
                        os.remove(os.path.join(history_dir, name))
                        deleted.append(name)
                return {
                    "success": True,
                    "data": {"deleted": deleted, "count": len(deleted)},
                    "message": "All history records deleted",
                    "code": 200
                }

            if not path_param:
                return {"success": False, "message": "Missing parameter: path or set all=true", "code": 400}

            # 直接删除绝对路径
            os.remove(path_param)
            return {
                "success": True,
                "data": {"deleted": [os.path.basename(path_param)], "count": 1},
                "message": "History record deleted",
                "code": 200
            }

        except Exception as e:
            logger.error(f"Error in delete_synthesis_history: {str(e)}")
            return {"success": False, "message": str(e), "code": 500}
    
    def validate_audio_file(self, filepath: str) -> Dict[str, Any]:
        """
        验证音频文件是否存在
        
        Args:
            filepath: 音频文件路径
            
        Returns:
            Dict: 验证结果
        """
        try:
            if not filepath:
                return {"success": False, "message": "Missing required parameter: filepath", "code": 400}

            if not os.path.exists(filepath):
                return {"success": False, "message": "Audio file not found", "code": 404}
            
            return {"success": True, "filepath": filepath, "code": 200}
        
        except Exception as e:
            logger.error(f"Error in validate_audio_file: {str(e)}")
            return {"success": False, "message": str(e), "code": 500}

    def save_synthesis_history(self, record_id: str,
                           input_config_raw: Dict[str, Any],
                           status: str, filepath: str) -> str:
        """
        保存一次合成的历史记录到本地 JSON 文件。

        Args:
            record_id: 唯一ID
            input_config_raw: 前端传入的原始配置（原样保留）
            status: "success" 或 "error"
            file_path: 合成后的音频文件路径

        Returns:
            str: 保存的历史记录文件路径
        """
        os.makedirs(_HISTORY_DIR, exist_ok=True)
        history_path = os.path.join(_HISTORY_DIR, f"{record_id}.json")
        history_record = {
            "id": record_id,
            "input_config_raw": input_config_raw,
            "status": status,
            "history_path": history_path,
            "file_path": filepath
        }
        with open(history_path, 'w', encoding='utf-8') as f:
            json.dump(history_record, f, ensure_ascii=False, indent=2)
        return history_path
