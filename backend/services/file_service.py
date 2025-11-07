import os
import json
import uuid
import logging
from typing import Dict, List, Any, Optional, Tuple
from werkzeug.datastructures import FileStorage
from utils.common import pathFormat, get_directory_structure

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FileService:
    """文件处理服务"""
    
    def __init__(self):
        pass
    
    # ---------------------- 上传相关 ----------------------
    def upload_audio(
        self,
        file: FileStorage,
        base_upload_dir: str,
        max_size: int,
        request_content_length: Optional[int] = None,
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str], int]:
        """
        处理音频文件上传逻辑。

        Returns: (result_dict, error_message, http_code)
        """
        # 基本参数校验
        if not file:
            return None, "No file part", 400
        if file.filename == '':
            return None, "No selected file", 400
        if not (file.content_type and file.content_type.startswith('audio/')):
            return None, "File type not allowed", 400

        # 大小校验（整体请求长度优先）
        try:
            max_size_int = int(max_size or 0)
        except Exception:
            max_size_int = 0
        if max_size_int > 0:
            try:
                if request_content_length and request_content_length > max_size_int:
                    return None, f"File too large, limit {max_size_int} bytes", 413
            except Exception:
                pass
            # 单文件大小兜底检查
            file_size = getattr(file, 'content_length', None)
            if not file_size:
                try:
                    current_pos = file.stream.tell()
                    file.stream.seek(0, os.SEEK_END)
                    file_size = file.stream.tell()
                    file.stream.seek(current_pos)
                except Exception:
                    file_size = None
            if file_size and file_size > max_size_int:
                return None, f"File too large, limit {max_size_int} bytes", 413

        # 目标目录解析：直接使用 base_upload_dir 作为上传根目录
        dest_dir = os.path.abspath(base_upload_dir)
        os.makedirs(dest_dir, exist_ok=True)

        # 生成唯一文件名并保存
        filename = file.filename
        unique_filename = f"{uuid.uuid4().hex[:4]}_{filename}"
        file_path = os.path.join(dest_dir, unique_filename)

        try:
            file.save(file_path)
        except Exception as e:
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    pass
            return None, f"Failed to upload file: {str(e)}", 500

        # 生成预览 URL（沿用原逻辑，与现有路由保持兼容）
        preview_url = f"/api/audio/preview/{unique_filename}"

        result = {
            "filename": unique_filename,
            "original_filename": filename,
            "file_path": file_path,
            "path": base_upload_dir,
            "preview_url": preview_url,
        }
        return result, None, 200

    # ---------------------- 列表相关 ----------------------
    def list_files(
        self,
        path_param: str,
        base_upload_dir: str,
        allowed_extensions: List[str],
    ) -> Tuple[Optional[List[Dict[str, Any]]], Optional[str], int]:
        """
        列出上传目录的文件（支持子路径）。
        Returns: (files_list, error_message, http_code)
        """
        path_param = (path_param or '').strip('/')
        base_dir = os.path.abspath(base_upload_dir)
        target_dir = os.path.abspath(os.path.join(base_dir, path_param)) if path_param else base_dir

        # 路径安全检查
        if not target_dir.startswith(base_dir):
            return None, "Invalid list path", 400

        files: List[Dict[str, Any]] = []
        if not os.path.exists(target_dir):
            os.makedirs(target_dir, exist_ok=True)
        for filename in os.listdir(target_dir):
            file_path = os.path.join(target_dir, filename)
            if os.path.isfile(file_path) and filename.lower().endswith(tuple(allowed_extensions)):
                try:
                    files.append({
                        "filename": filename,
                        "size": os.path.getsize(file_path),
                        "created_at": os.path.getctime(file_path),
                        "file_path": file_path,
                        "path": path_param,
                    })
                except Exception as e:
                    logger.warning(f"Failed reading file info {filename}: {e}")
                    continue

        files.sort(key=lambda x: x["created_at"], reverse=True)
        return files, None, 200

    # ---------------------- 目录结构 ----------------------
    def get_structure(self, path: str, base_url: str):
        """获取目录结构，支持懒加载。"""
        try:
            # 处理路径前缀
            if path.startswith("local:///"):
                path = path.replace("local:///", "/")
            elif path.startswith("local://"):
                path = path.replace("local://", "/")

            full_path = pathFormat(path)
            # 如果路径是文件，则返回其目录
            if os.path.isfile(full_path):
                full_path = os.path.dirname(full_path)

            structure = get_directory_structure(full_path, base_url)
            return structure, None, 200
        except Exception as e:
            return None, f"获取目录结构失败: {str(e)}", 400

    # ---------------------- 创建目录 ----------------------
    def make_dir(self, folder_name: str, path: str) -> Tuple[bool, Optional[str], int, Optional[str]]:
        """
        创建目录。
        Returns: (success, error_message, http_code, full_path)
        """
        try:
            full_path = os.path.join(pathFormat(path), folder_name)
            if os.path.exists(full_path):
                return False, f"文件夹 {folder_name} 已经存在: {full_path}", 400, full_path
            os.makedirs(full_path)
            return True, None, 200, full_path
        except Exception as e:
            return False, f"创建文件夹失败: {str(e)}", 500, None

    # ---------------------- 路径检测 ----------------------
    def check_path(self, path: str) -> Tuple[Dict[str, Any], Optional[str], int]:
        """
        检测目录是否存在，并返回是否有数据。
        Returns: (result_dict, error_message, http_code)
        """
        try:
            full_path = pathFormat(path)
            exists = os.path.exists(full_path)
            has_data = exists and len(os.listdir(full_path)) > 0
            return {"exists": exists, "has_data": has_data}, None, 200
        except Exception as e:
            return {}, f"路径检测失败: {str(e)}", 500
    
    # ---------------------- 配置读取 ----------------------
    # ---------------------- 配置读取 ----------------------
    def _ensure_conf_file(self, conf_path: str) -> Tuple[Dict[str, Any], Optional[str], int]:
        """
        确保配置文件存在并可读，返回 (data, error, code)
        """
        parent_dir = os.path.dirname(conf_path)
        if parent_dir:
            os.makedirs(parent_dir, exist_ok=True)

        if not os.path.isfile(conf_path):
            with open(conf_path, 'w', encoding='utf-8') as f:
                json.dump({}, f, ensure_ascii=False, indent=2)
            return {}, None, 200

        try:
            with open(conf_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if not isinstance(data, dict):
                    data = {}
            return data, None, 200
        except json.JSONDecodeError:
            return {}, None, 200
        except Exception as e:
            return None, str(e), 500

    def _write_conf_file(self, conf_path: str, data: Dict[str, Any]) -> Optional[str]:
        """
        将 data 写回配置文件，返回错误信息或 None
        """
        try:
            parent_dir = os.path.dirname(conf_path)
            if parent_dir:
                os.makedirs(parent_dir, exist_ok=True)
            with open(conf_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return None
        except Exception as e:
            return str(e)

    def get_config_json(self) -> Tuple[Optional[Dict[str, Any]], Optional[str], int]:
        """
        读取配置 JSON 内容。
        优先读取环境变量 `FLASK_CONF_DIR` 指定的完整文件路径（包含文件名），
        如果配置文件不存在，则读取环境变量中的 upload_path、history_path、output_path 并返回默认格式。
        如果 FLASK_CONF_DIR 不存在，则创建该文件并将环境变量中的值写入。

        Returns: (data_dict, error_message, http_code)
        """
        try:
            conf_path = os.getenv('FLASK_CONF_DIR')
            if not conf_path:
                data = {
                    "upload_path": os.getenv('upload_path', ''),
                    "history_path": os.getenv('history_path', ''),
                    "output_path": os.getenv('output_path', '')
                }
                return data, None, 200

            if os.path.isfile(conf_path):
                with open(conf_path, 'r', encoding='utf-8') as f:
                    try:
                        data = json.load(f)
                    except json.JSONDecodeError as je:
                        return None, f"配置文件解析失败: {str(je)}", 400
                return data, None, 200

            data = {
                "upload_path": os.getenv('upload_path', ''),
                "history_path": os.getenv('history_path', ''),
                "output_path": os.getenv('output_path', '')
            }
            err = self._write_conf_file(conf_path, data)
            if err:
                return None, err, 500
            return data, None, 200

        except Exception as e:
            return None, str(e), 500

    def update_config(self, upload_path: Optional[str], output_path: Optional[str]) -> Tuple[Optional[Dict[str, Any]], Optional[str], int]:
        """
        更新配置文件中的路径项：upload_path 和 output_path。
        - 使用环境变量 `FLASK_CONF_DIR` 指定的完整文件路径（包含文件名）。
        - 若文件不存在则创建，已存在则在原基础上更新对应字段。

        Returns: (updated_data, error_message, http_code)
        """
        if not upload_path or not output_path:
            return None, "缺少必要参数: upload_path 或 output_path", 400

        conf_path = os.getenv('FLASK_CONF_DIR')
        current_data, err, code = self._ensure_conf_file(conf_path)
        if err:
            return None, err, code

        current_data['upload_path'] = upload_path
        current_data['output_path'] = output_path

        err = self._write_conf_file(conf_path, current_data)
        if err:
            return None, err, 500
        return current_data, None, 200

    # ---------------------- 配置重置（从环境变量） ----------------------
    def reset_config_from_env(self) -> Tuple[Optional[Dict[str, Any]], Optional[str], int]:
        """
        读取 .env/.环境中的 变量，重置 upload_path、history_path、output_path 三个字段。
        若 FLASK_CONF_DIR 指定的文件不存在则先创建。

        Returns: (updated_data, error_message, http_code)
        """
        conf_path = os.getenv('FLASK_CONF_DIR')
        current_data, err, code = self._ensure_conf_file(conf_path)
        if err:
            return None, err, code

        current_data['upload_path'] = os.getenv('upload_path')
        current_data['history_path'] = os.getenv('history_path')
        current_data['output_path'] = os.getenv('output_path')

        err = self._write_conf_file(conf_path, current_data)
        if err:
            return None, err, 500
        return current_data, None, 200
    
    
    