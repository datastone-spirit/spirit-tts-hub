from flask import Blueprint, request, jsonify, send_file
from services.audio_service import AudioService
from utils.common import success_res, error_res
from flasgger import swag_from
from swagger.audio_routes_swagger import audio_preview_spec

audio_bp = Blueprint('audio', __name__)
audio_service = AudioService()

@audio_bp.route('/preview', methods=['GET'])
@swag_from(audio_preview_spec)
def preview_audio():
    """预览音频文件"""
    try:
        # 从查询参数获取 filename
        filename = request.args.get('filename')
        
        # 使用 audio_service 获取文件路径
        file_path, error = audio_service.get_audio_file_path(filename)
        if error:
            if "Missing filename parameter" in error:
                return jsonify(error_res(message=error, code=400))
            elif "Audio file not found" in error:
                return jsonify(error_res(message=error, code=404))
            else:
                return jsonify(error_res(message=error, code=500))
        
        # 获取MIME类型
        mime_type = audio_service.get_audio_mime_type(file_path)
        
        return send_file(
            file_path,
            mimetype=mime_type
        )

    except Exception as e:
        return jsonify(error_res(message=str(e), code=500))