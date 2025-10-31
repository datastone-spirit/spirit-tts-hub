import os
import mimetypes
import logging
from typing import Dict, List, Any, Optional, Tuple
from werkzeug.utils import secure_filename

from utils.audio_utils import AudioProcessor

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AudioService:
    """音频处理服务"""
    
    def __init__(self):
        self.audio_processor = AudioProcessor()
        self.base_dir = os.path.dirname(os.path.dirname(__file__))  # backend/
    
    def get_audio_file_path(self, filename: str) -> Tuple[str, Optional[str]]:
        """
        获取音频文件路径
        
        Args:
            filename: 文件名
            
        Returns:
            Tuple[str, Optional[str]]: (文件路径, 错误信息)
        """
        try:
            if not filename:
                return "", "Missing filename parameter"
            
            # 如果 filename 不是绝对路径，则去 examples 目录下查找
            if not os.path.isabs(filename):
                # 构造 examples 目录路径
                examples_dir = os.path.join(self.base_dir, 'examples')
                filename = os.path.join(examples_dir, secure_filename(filename))
            
            # 确保路径是绝对路径
            filename = os.path.abspath(filename)
            
            if not os.path.exists(filename):
                return "", "Audio file not found"
            
            return filename, None
            
        except Exception as e:
            logger.error(f"Error getting audio file path: {str(e)}")
            return "", str(e)
    
    def get_audio_mime_type(self, filename: str) -> str:
        """
        获取音频文件的MIME类型
        
        Args:
            filename: 文件路径
            
        Returns:
            str: MIME类型
        """
        mime_type, _ = mimetypes.guess_type(filename)
        return mime_type or "application/octet-stream"