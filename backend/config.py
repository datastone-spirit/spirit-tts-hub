import os
from pathlib import Path

# 项目根目录
BASE_DIR = Path(__file__).resolve().parent

class Config:
    """基础配置类"""
    
    # 上传文件配置
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'weba'}
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB

    
    # TTS模型配置
    DEFAULT_TTS_MODEL = os.environ.get('DEFAULT_TTS_MODEL') or 'index-tts/checkpoints'
    INDEX_TTS_MODEL_DIR = os.getenv('INDEX_TTS_MODEL_DIR')
    INDEX_TTS_DEVICE = os.getenv('INDEX_TTS_DEVICE')
    INDEX_TTS_FP16 = os.getenv('INDEX_TTS_FP16', 'false').lower() == 'true'
    INDEX_TTS_DEEPSPEED = os.getenv('INDEX_TTS_DEEPSPEED', 'false').lower() == 'true'
    INDEX_TTS_CUDA_KERNEL = os.getenv('INDEX_TTS_CUDA_KERNEL', 'false').lower() == 'true'


    @staticmethod
    def init_app(app):
        """初始化应用"""
        # 确保上传目录存在


class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True

# 配置字典
config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig
}