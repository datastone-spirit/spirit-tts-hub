from flask import Blueprint, request, jsonify, current_app
import os
import json

from services.file_service import FileService
from utils.common import success_res, error_res
from flasgger import swag_from
from swagger.file_routes_swagger import file_upload_spec, file_list_spec, file_get_spec, file_makedir_spec, path_check_spec, file_config_spec, file_config_update_spec, file_config_reset_spec

file_bp = Blueprint('file', __name__)
file_service = FileService()

@file_bp.route('/upload', methods=['POST'])
@swag_from(file_upload_spec)
def upload_file():
    """上传文件"""
    # 使用服务层处理上传逻辑
    if 'file' not in request.files:
        return jsonify(error_res(message="No file part", code=400))

    file = request.files['file']
    max_size = current_app.config.get('MAX_CONTENT_LENGTH')
    
    # 优先读取 conf/conf.json 中的 upload_path，没有则使用环境变量中的 upload_path
    config_data, err, code = file_service.get_config_json()
    base_upload_dir = config_data['upload_path']
    result, err, code = file_service.upload_audio(
        file=file,
        base_upload_dir=base_upload_dir,
        max_size=max_size,
        request_content_length=request.content_length,
    )
    if err:
        return jsonify(error_res(message=err, code=code)), code
    return jsonify(success_res(data=result, message="File uploaded successfully"))


@file_bp.route('/list', methods=['GET'])
@swag_from(file_list_spec)
def list_files():
    """列出已上传的音频文件（支持子路径）"""
    try:
        path_param = (request.args.get('path', '') or '').strip('/')
        config_data, err, code = file_service.get_config_json()
        base_upload_dir = config_data['upload_path']
        files, err, code = file_service.list_files(
            path_param=path_param,
            base_upload_dir=base_upload_dir,
            allowed_extensions=list(current_app.config['ALLOWED_EXTENSIONS']),
        )
        if err:
            return jsonify(error_res(message=err, code=code)), code
        return jsonify(success_res(data={"files": files}, message="Audio files retrieved successfully"))
    except Exception as e:
        return jsonify(error_res(message=str(e), code=500))


@file_bp.route('/file', methods=['GET'])
@swag_from(file_get_spec)
def get_file():
    """获取存储中目录结构，支持懒加载（仅返回当前目录的直接子项）"""
    try:
        path = request.args.get('path', '')
        url = request.host_url
        structure, err, code = file_service.get_structure(path, url)
        if err:
            return jsonify(error_res(message=err, code=code)), code
        return structure
    except Exception as e:
        return jsonify(error_res(message=f"获取目录结构失败: {str(e)}", code=400))

@file_bp.route('/file', methods=['POST'])
@swag_from(file_makedir_spec)
def makedir():
    """提交一些数据到存储中"""
    data = request.get_json()
    folder_name = data.get('name', '')
    path = request.args.get('path', '')
    success, err, code, full_path = file_service.make_dir(folder_name, path)
    if err:
        return jsonify(error_res(message=err, code=code)), code
    return jsonify(success_res(message=f"文件夹 {folder_name} 创建成功: {full_path}"))

@file_bp.route('/path_check', methods=['GET'])
@swag_from(path_check_spec)
def path_check():
    """检测目录是否存在"""
    path = request.args.get("path", "")
    result, err, code = file_service.check_path(path)
    return jsonify(success_res(data=result, message="路径检测完成"))
    
@file_bp.route('/config', methods=['GET'])
@swag_from(file_config_spec)
def get_config():
    """获取配置文件内容"""
    try:
        data, err, code = file_service.get_config_json()
        if err:
            return jsonify(error_res(message=err, code=code)), code
        return jsonify(success_res(data=data, message="配置文件内容获取成功"))
    except Exception as e:
        return jsonify(error_res(message=str(e), code=500)), 500

@file_bp.route('/config', methods=['POST'])
@swag_from(file_config_update_spec)
def update_config():
    """更新配置文件（upload_path, output_path）"""
    try:
        data = request.get_json() or {}
        upload_path = data.get('upload_path')
        output_path = data.get('output_path')

        updated, err, code = file_service.update_config(upload_path=upload_path, output_path=output_path)
        if err:
            return jsonify(error_res(message=err, code=code)), code
        return jsonify(success_res(data=updated, message="配置更新成功"))
    except Exception as e:
        return jsonify(error_res(message=str(e), code=500)), 500

@file_bp.route('/config/reset', methods=['POST'])
@swag_from(file_config_reset_spec)
def reset_config():
    """重置配置文件"""
    try:
        updated, err, code = file_service.reset_config_from_env()
        if err:
            return jsonify(error_res(message=err, code=code)), code
        return jsonify(success_res(data=updated, message="配置已根据环境变量重置"))
    except Exception as e:
        return jsonify(error_res(message=str(e), code=500)), 500
    
    