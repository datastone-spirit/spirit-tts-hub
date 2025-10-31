synthesize_spec = {
    "tags": ["TTS"],
    "consumes": ["application/json"],
    "parameters": [
        {
            "in": "body",
            "name": "body",
            "required": True,
            "schema": {
                "type": "object",
                "properties": {
                    "spk_audio_prompt": {"type": "string", "description": "音色参考音频文件路径，支持决定路径和文件名(文件名情况下会拼接examples目录)"},
                    "text": {"type": "string", "description": "需要合成的原始文本内容"},
                    "max_text_tokens_per_segment": {"type": "integer", "default": 120, "description": "文本分段的最大 token 数量，默认：120（gen_single.max_text_tokens_per_segment）"},
                    "emo_control_method": {"type": "integer", "enum": [0,1,2,3], "default": 0, "description": "情感控制方式：0=与音色参考相同，1=情感参考音频，2=情感向量控制，3=情感描述文本"},
                    "emo_ref_path": {"type": "string", "description": "情感参考音频文件路径（当 emo_control_method=3 时生效）"},
                    "emo_weight": {"type": "number", "format": "float", "default": 0.8, "minimum": 0.0, "maximum": 1.0, "description": "外部情感强度权重（0.0-1.0），默认：0.8"},
                    "emo_random": {"type": "boolean", "default": False, "description": "是否启用随机情绪采样，默认：false"},
                    "vec1": {"type": "number", "format": "float", "minimum": 0.0, "maximum": 1.0, "default": 0.0, "description": "情绪向量1：喜（0-1）"},
                    "vec2": {"type": "number", "format": "float", "minimum": 0.0, "maximum": 1.0, "default": 0.0, "description": "情绪向量2：怒（0-1）"},
                    "vec3": {"type": "number", "format": "float", "minimum": 0.0, "maximum": 1.0, "default": 0.0, "description": "情绪向量3：哀（0-1）"},
                    "vec4": {"type": "number", "format": "float", "minimum": 0.0, "maximum": 1.0, "default": 0.0, "description": "情绪向量4：惧（0-1）"},
                    "vec5": {"type": "number", "format": "float", "minimum": 0.0, "maximum": 1.0, "default": 0.0, "description": "情绪向量5：厌恶（0-1）"},
                    "vec6": {"type": "number", "format": "float", "minimum": 0.0, "maximum": 1.0, "default": 0.0, "description": "情绪向量6：低落（0-1）"},
                    "vec7": {"type": "number", "format": "float", "minimum": 0.0, "maximum": 1.0, "default": 0.0, "description": "情绪向量7：惊喜（0-1）"},
                    "vec8": {"type": "number", "format": "float", "minimum": 0.0, "maximum": 1.0, "default": 0.0, "description": "情绪向量8：平静（0-1）"},
                    "prompt": {"type": "string", "description": "情感描述文本（当 emo_control_method=3 时生效；留空将回退为主文本描述）"},
                    "do_sample": {"type": "boolean", "default": True, "description": "启用 GPT-2 采样，默认：true"},
                    "temperature": {"type": "number", "format": "float", "default": 0.8, "minimum": 0.1, "maximum": 2.0, "description": "采样温度 0.1-2，默认：0.8"},
                    "top_p": {"type": "number", "format": "float", "default": 0.8, "minimum": 0.0, "maximum": 1.0, "description": "核采样 TopP 0-1，默认：0.8"},
                    "top_k": {"type": "integer", "default": 30, "minimum": 0, "maximum": 100, "description": "TopK 0-100，默认：30；当值≤0时视为关闭（可传 null）"},
                    "num_beams": {"type": "integer", "default": 3, "minimum": 1, "maximum": 10, "description": "Beam Search 的 beam 数 1-10，默认：3"},
                    "repetition_penalty": {"type": "number", "format": "float", "default": 10.0, "description": "重复惩罚系数，默认：10"},
                    "length_penalty": {"type": "number", "format": "float", "default": 0.0, "description": "长度惩罚系数，默认：0"},
                    "max_mel_tokens": {"type": "integer", "default": 1500, "minimum": 50, "maximum": 1810, "description": "最大 mel 令牌数 50-1810，默认：1500"},
                    "raw_data": {"type": "string", "description": "原始数据"},
                    "output_path": {"type": "string", "description": "输出音频文件路径，默认：outputs"}
                },
                "required": ["text", "spk_audio_prompt", "raw_data"],
                "example": {
                    "spk_audio_prompt": "uploads/voice_refs/speaker_demo.wav",
                    "text": "请把下面这段文字转换为语音输出。",
                    "max_text_tokens_per_segment": 120,
                    "emo_control_method": 2,
                    "emo_ref_path": "uploads/emotions/happy.wav",
                    "emo_weight": 0.8,
                    "emo_random": False,
                    "vec1": 0.6,
                    "vec2": 0.0,
                    "vec3": 0.1,
                    "vec4": 0.0,
                    "vec5": 0.0,
                    "vec6": 0.0,
                    "vec7": 0.2,
                    "vec8": 0.3,
                    "prompt": "温柔、缓慢、略带惊喜",
                    "do_sample": True,
                    "temperature": 0.8,
                    "top_p": 0.8,
                    "top_k": 30,
                    "num_beams": 3,
                    "repetition_penalty": 10.0,
                    "length_penalty": 0.0,
                    "max_mel_tokens": 1500,
                    "raw_data": "",
                    "output_path": "outputs"
                }
            },
        }
    ],
    "responses": {
        "200": {
            "description": "合成成功",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "audio_path": {"type": "string"},
                        },
                    },
                    "message": {"type": "string"},
                },
            },
        },
        "400": {"description": "请求参数错误"},
        "500": {"description": "服务器错误"},
    },
}


parse_tokens_spec = {
    "tags": ["TTS"],
    "consumes": ["application/json"],
    "parameters": [
        {
            "in": "body",
            "name": "body",
            "required": True,
            "schema": {
                "type": "object",
                "properties": {
                    "text": {"type": "string", "description": "需要切分的文本"},
                    "max_text_tokens_per_segment": {
                        "type": "integer",
                        "default": 120,
                        "description": "每段的最大token数",
                    },
                },
            },
        }
    ],
    "responses": {
        "200": {
            "description": "成功返回文本分段",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "segments": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "index": {"type": "integer"},
                                        "content": {"type": "string"},
                                        "token_count": {"type": "integer"},
                                    },
                                    "required": ["index", "content", "token_count"],
                                },
                            }
                        },
                        "required": ["segments"],
                    },
                    "message": {"type": "string"},
                },
                "required": ["success", "data"],
            },
            "examples": {
                "application/json": {
                    "success": True,
                    "data": {
                        "segments": [
                            {"index": 0, "content": "示例文本段", "token_count": 5},
                            {"index": 1, "content": "另一段", "token_count": 3},
                        ]
                    },
                    "message": "Text segmented successfully",
                }
            },
        },
        "400": {"description": "请求参数缺失"},
        "500": {"description": "服务器错误"},
    },
}


# 历史查询接口 Swagger
history_spec = {
    "tags": ["TTS"],
    "parameters": [
        {
            "in": "query",
            "name": "start",
            "type": "number",
            "required": False,
            "description": "开始时间戳（毫秒）",
        },
        {
            "in": "query",
            "name": "end",
            "type": "number",
            "required": False,
            "description": "结束时间戳（毫秒）",
        },
    ],
    "responses": {
        "200": {
            "description": "成功返回历史记录",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "records": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "id": {"type": "string"},
                                        "timestamp": {"type": "string"},
                                        "audio_file_path": {"type": "string"},
                                        "audio_file_name": {"type": "string"},
                                        "input_config_raw": {"type": "object"},
                                        "input_config_converted": {"type": "object"},
                                        "status": {"type": "string"},
                                    },
                                    "required": ["id", "timestamp", "status"],
                                },
                            },
                            "total": {"type": "integer"},
                        },
                        "required": ["records", "total"],
                    },
                    "message": {"type": "string"},
                },
                "required": ["success", "data"],
            },
        },
        "500": {"description": "服务器错误"},
    },
}

download_spec = {
    "tags": ["TTS"],
    "parameters": [
        {
            "in": "path",
            "name": "filepath",
            "type": "string",
            "required": True,
            "description": "要下载的音频文件名(含路径)",
        }
    ],
    "responses": {
        "200": {"description": "成功返回音频文件"},
        "404": {"description": "找不到音频文件"},
        "500": {"description": "服务器错误"},
    },
}


# 历史删除接口 Swagger
delete_history_spec = {
    "tags": ["TTS"],
    "parameters": [
        {
            "in": "body",
            "name": "all",
            "type": "string",
            "required": False,
            "description": "是否删除所有历史记录，传 'true' 表示全部删除",
        },
        {
            "in": "body",
            "name": "path",
            "type": "string",
            "required": False,
            "description": "要删除的单条历史记录(绝对地址)",
        },
    ],
    "responses": {
        "200": {
            "description": "删除成功",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "deleted": {
                                "type": "array",
                                "items": {"type": "string"},
                            },
                            "count": {"type": "integer"},
                        },
                        "required": ["deleted", "count"],
                    },
                    "message": {"type": "string"},
                },
                "required": ["success", "data"],
            },
        },
        "400": {"description": "请求参数错误（缺少 path 或 all）"},
        "403": {"description": "非法路径（不在历史目录内）"},
        "404": {"description": "历史记录不存在"},
        "500": {"description": "服务器错误"},
    },
}