from .tts_routes import tts_bp
from .file_routes import file_bp
from .audio_routes import audio_bp
from .role_routes import roles_bp

def register_routes(app):
    """注册所有蓝图路由"""
    app.register_blueprint(tts_bp, url_prefix='/api/tts')
    app.register_blueprint(file_bp, url_prefix='/api/files')
    app.register_blueprint(audio_bp, url_prefix='/api/audio')
    app.register_blueprint(roles_bp, url_prefix='/api/roles')