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

# =========================
# 历史记录保存/查询工具函数
# =========================

# 历史记录目录（统一定义）
_BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))
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
    
    def get_tts(self):
        """获取 TTS 实例（懒加载）"""
        if self._tts_instance is None:
            from indextts.infer_v2 import IndexTTS2
            
            # 解析模型目录：优先使用环境/配置的 INDEX_TTS_MODEL_DIR；否则使用 DEFAULT_TTS_MODEL；再否则使用默认相对路径
            cfg_val = (
                current_app.config.get('INDEX_TTS_MODEL_DIR')
                or current_app.config.get('DEFAULT_TTS_MODEL')
                or 'index-tts/checkpoints'
            )
            # 将相对路径解析为相对于 backend 目录的绝对路径，确保 model_dir 与 cfg_path 一致
            model_dir_path = cfg_val if os.path.isabs(cfg_val) else os.path.abspath(os.path.join(self.base_dir, cfg_val))

            self._tts_instance = IndexTTS2(
                model_dir=model_dir_path,
                cfg_path=os.path.join(model_dir_path, 'config.yaml'),
                device=current_app.config.get('INDEX_TTS_DEVICE') or None,
                use_fp16=self._as_bool(current_app.config.get('INDEX_TTS_FP16'), False),
                use_deepspeed=self._as_bool(current_app.config.get('INDEX_TTS_DEEPSPEED'), False),
                use_cuda_kernel=self._as_bool(current_app.config.get('INDEX_TTS_CUDA_KERNEL'), False),
            )
        return self._tts_instance
    
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
            history_dir = os.path.join(self.base_dir, 'history', 'synthesize')
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
                           status: str) -> str:
        """
        保存一次合成的历史记录到本地 JSON 文件。

        Args:
            record_id: 唯一ID
            input_config_raw: 前端传入的原始配置（原样保留）
            status: "success" 或 "error"

        Returns:
            str: 保存的历史记录文件路径
        """
        os.makedirs(_HISTORY_DIR, exist_ok=True)
        history_path = os.path.join(_HISTORY_DIR, f"{record_id}.json")
        history_record = {
            "id": record_id,
            "input_config_raw": input_config_raw,
            "status": status,
            "history_path": history_path
        }
        with open(history_path, 'w', encoding='utf-8') as f:
            json.dump(history_record, f, ensure_ascii=False, indent=2)
        return history_path
