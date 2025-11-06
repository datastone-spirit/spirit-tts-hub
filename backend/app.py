#!/usr/bin/env python

from flask import Flask, jsonify, send_from_directory, abort
from flask_cors import CORS
from flasgger import Swagger
import os
import sys
from dotenv import load_dotenv

current_dir = os.path.dirname(os.path.abspath(__file__))
index_tts_root = os.path.join(current_dir, "index-tts")
sys.path.append(index_tts_root)

def _load_env_vars():
    """Load env file depending on FLASK_ENV/FLASK_CONFIG.
    Prefer backend/.env.<env>, fallback to backend/.env.
    """
    env_name = os.getenv('FLASK_ENV') or os.getenv('FLASK_CONFIG') or 'development'
    candidate = os.path.join(current_dir, f".env.{env_name}")
    if os.path.isfile(candidate):
        load_dotenv(candidate)
    else:
        load_dotenv(os.path.join(current_dir, ".env"))

# 加载环境变量（优先按环境选择特定 .env 文件）
_load_env_vars()

def _normalize_hf_cache_envs():
    """Unify HF/Transformers cache env vars, resolving relative paths
    against backend directory for portability.
    """
    default_rel = os.path.join(".", "checkpoints", "hf_cache")
    # Prefer existing env values, fallback to default relative path
    cache_val = (
        os.getenv("HF_HUB_CACHE")
        or os.getenv("HUGGINGFACE_HUB_CACHE")
        or os.getenv("HF_HOME")
        or os.getenv("TRANSFORMERS_CACHE")
        or default_rel
    )
    # Resolve relative to backend directory (not CWD)
    cache_path = cache_val if os.path.isabs(cache_val) else os.path.abspath(os.path.join(current_dir, cache_val))

    # Ensure exists
    try:
        os.makedirs(cache_path, exist_ok=True)
    except Exception:
        pass

    # Set all related envs to the same normalized path
    os.environ["HF_HUB_CACHE"] = cache_path
    os.environ["HUGGINGFACE_HUB_CACHE"] = cache_path
    os.environ["HF_HOME"] = cache_path
    os.environ["TRANSFORMERS_CACHE"] = cache_path


# 统一缓存环境变量（在导入路由前）
_normalize_hf_cache_envs()

from config import config
from routes import register_routes
# from services.tts_service import ensure_tts_preloaded
from services.tts_service import TtsService

def _get_frontend_dist_dir():
    dist_dir = os.path.abspath(os.path.join(current_dir, "..", "dist"))
    return dist_dir

def create_app(config_name='default'):
    """创建Flask应用实例"""
    # 使用 Flask 内置静态路由，将 dist 目录映射到 /admin
    app = Flask(__name__, static_folder=_get_frontend_dist_dir(), static_url_path='/admin')

    # 根据传入的 config_name 覆盖加载对应环境的 .env 文件（如果存在）
    try:
        env_file = os.path.join(current_dir, f".env.{config_name}")
        if os.path.isfile(env_file):
            load_dotenv(env_file, override=True)
    except Exception:
        pass
    
    # 加载配置
    app.config.from_object(config[config_name])
    
    # 初始化CORS
    CORS(app)

    # 配置并初始化 Swagger（Flasgger）
    app.config['SWAGGER'] = {
        'title': 'Spirit TTS Hub API',
        'uiversion': 3,
        'ui_params': {
            # 避免前端脚本中出现 None 未定义错误
            'validatorUrl': ''
        }
    }
    Swagger(app, config={
        'headers': [],
        'specs': [
            {
                'endpoint': 'apispec_1',
                'route': '/apispec_1.json',
                'rule_filter': lambda rule: True,  # all in
                'model_filter': lambda tag: True,  # all in
            }
        ],
        'static_url_path': '/flasgger_static',
        'swagger_ui': True,
        'specs_route': '/apidocs/'
    })
    
    # 设置前端静态目录
    app.static_folder = _get_frontend_dist_dir()

    # 静态资源（assets）
    @app.route('/admin/assets/<path:filename>')
    def serve_assets(filename):
        assets_dir = os.path.join(app.static_folder, 'assets')
        if not os.path.isdir(assets_dir):
            abort(404)
        return send_from_directory(assets_dir, filename)

    # SPA 入口与路由回退
    @app.route('/', defaults={'path': ''})
    @app.route('/admin/<path:path>')
    def serve_admin(path):
        index_path = os.path.join(app.static_folder, 'index.html')
        if not os.path.exists(index_path):
            abort(404)
        return send_from_directory(app.static_folder, 'index.html')

    # 注册路由
    register_routes(app)

    # 启动阶段预加载同进程 TTS，避免 Flask reloader 重复加载
    try:
        debug_enabled = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
        # 当启用调试模式时，仅在 reloader 子进程执行预加载
        if not debug_enabled or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
            TtsService().ensure_tts_preloaded(app)
    except Exception:
        pass
    
    return app

if __name__ == '__main__':
    app = create_app(os.getenv('FLASK_CONFIG') or 'default')
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5005)), debug=os.getenv('FLASK_DEBUG', 'False').lower() == 'true')