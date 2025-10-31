from flask import Blueprint, request, jsonify, send_file
import os
from utils.common import success_res, error_res
from services.tts_service import TtsService
from flasgger import swag_from
from swagger.tts_routes_swagger import synthesize_spec, parse_tokens_spec, history_spec, download_spec, delete_history_spec

tts_bp = Blueprint('tts', __name__)

# 初始化 TTS 服务
tts_service = TtsService()

@tts_bp.route('/synthesize', methods=['POST'])
@swag_from(synthesize_spec)
def synthesize_speech():
    """将文本转换为语音"""
    data = request.json
    result = tts_service.synthesize_speech(data)
    
    if result["success"]:
        return jsonify(success_res(data=result["data"], message=result["message"]))
    else:
        return jsonify(error_res(message=result["message"], code=result["code"]))


@tts_bp.route('/history', methods=['GET'])
@swag_from(history_spec)
def get_synthesis_history():
    """查看合成历史记录，支持按时间筛选（时间参数为毫秒级时间戳）"""
    start_ms = request.args.get('start')
    end_ms = request.args.get('end')
    result = tts_service.get_synthesis_history(start_ms, end_ms)
    
    if result["success"]:
        return jsonify(success_res(data=result["data"], message=result["message"]))
    else:
        return jsonify(error_res(message=result["message"], code=result["code"]))


@tts_bp.route('/history/delete', methods=['DELETE'])
@swag_from(delete_history_spec)
def delete_synthesis_history():
    """删除历史记录"""
    payload = request.get_json(silent=True) or {}
    all_flag = request.args.get('all') or payload.get('all')
    path_param = request.args.get('path') or payload.get('path')
    
    result = tts_service.delete_synthesis_history(all_flag, path_param)
    
    if result["success"]:
        return jsonify(success_res(data=result["data"], message=result["message"]))
    else:
        return jsonify(error_res(message=result["message"], code=result["code"]))


@tts_bp.route('/parse-tokens', methods=['POST'])
@swag_from(parse_tokens_spec)
def parse_tokens():
    """文本分段与预览"""
    data = request.json
    result = tts_service.parse_tokens(data)
    
    if result["success"]:
        return jsonify(success_res(data=result["data"], message=result["message"]))
    else:
        return jsonify(error_res(message=result["message"], code=result["code"]))


@tts_bp.route('/download', methods=['GET'])
@swag_from(download_spec)
def download_audio():
    """下载生成的音频文件"""
    filepath = request.args.get('filepath')
    
    # 验证文件
    validation_result = tts_service.validate_audio_file(filepath)
    if not validation_result["success"]:
        return jsonify(error_res(message=validation_result["message"], code=validation_result["code"]))
    
    try:
        # 提取纯文件名作为下载时的文件名
        download_filename = os.path.basename(filepath)
        
        return send_file(
            filepath,
            mimetype="audio/wav",
            as_attachment=True,
            download_name=download_filename
        )
    
    except Exception as e:
        return jsonify(error_res(message=str(e), code=500))

