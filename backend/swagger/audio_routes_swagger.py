audio_preview_spec = {
    "tags": ["Audio"],
    "parameters": [
        {"in": "query", "name": "filename", "type": "string", "required": True, "description": "文件名"},
    ],
    "responses": {
        "200": {"description": "成功返回音频流"},
        "400": {"description": "路径非法"},
        "404": {"description": "文件不存在"},
        "500": {"description": "服务器错误"},
    },
}
