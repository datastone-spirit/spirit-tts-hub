file_upload_spec = {
    "tags": ["Files"],
    "consumes": ["multipart/form-data"],
    "parameters": [
        {"in": "formData", "name": "file", "type": "file", "required": True, "description": "要上传的文件"},
        {"in": "formData", "name": "path", "type": "string", "required": False, "description": "上传路径"},
    ],
    "responses": {
        "200": {
            "description": "上传成功",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "filename": {"type": "string"},
                            "original_filename": {"type": "string"},
                            "file_path": {"type": "string"},
                            "path": {"type": "string"},
                        },
                        "required": ["filename", "file_path"]
                    },
                    "message": {"type": "string"}
                },
                "required": ["success", "data"]
            },
            "examples": {
                "application/json": {
                    "success": True,
                    "data": {
                        "filename": "a1b2_test.wav",
                        "original_filename": "test.wav",
                        "file_path": "/abs/path/backend/uploads/a1b2_test.wav",
                        "path": "",
                    },
                    "message": "File uploaded successfully"
                }
            }
        },
        "400": {
            "description": "参数或类型错误",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "message": {"type": "string"},
                    "data": {"type": "object"},
                    "code": {"type": "integer"}
                },
                "required": ["success", "message", "code"]
            },
            "examples": {
                "application/json": {
                    "success": False,
                    "message": "File type not allowed",
                    "data": None,
                    "code": 400
                }
            }
        },
        "413": {
            "description": "文件过大，超过 MAX_CONTENT_LENGTH 限制",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "message": {"type": "string"},
                    "data": {"type": "object"},
                    "code": {"type": "integer"}
                },
                "required": ["success", "message", "code"]
            },
            "examples": {
                "application/json": {
                    "success": False,
                    "message": "File too large, limit 52428800 bytes",
                    "data": None,
                    "code": 413
                }
            }
        },
        "500": {"description": "服务器错误"},
    },
}


file_list_spec = {
    "tags": ["Files"],
    "parameters": [
        {"in": "query", "name": "path", "type": "string", "required": False, "description": "子路径（相对 uploads）"},
    ],
    "responses": {
        "200": {
            "description": "成功返回文件列表",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "files": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "filename": {"type": "string"},
                                        "size": {"type": "integer"},
                                        "created_at": {"type": "number"},
                                        "file_path": {"type": "string"},
                                        "path": {"type": "string"},
                                        "preview_url": {"type": "string"}
                                    },
                                    "required": ["filename", "size", "created_at", "file_path", "preview_url"]
                                }
                            }
                        },
                        "required": ["files"]
                    },
                    "message": {"type": "string"}
                },
                "required": ["success", "data"]
            },
            "examples": {
                "application/json": {
                    "success": True,
                    "data": {
                        "files": [
                            {
                                "filename": "demo.wav",
                                "size": 123456,
                                "created_at": 1710000000.0,
                                "file_path": "/abs/path/backend/uploads/demo.wav",
                                "path": "",
                                "preview_url": "/api/audio/preview/demo.wav"
                            }
                        ]
                    },
                    "message": "Audio files retrieved successfully"
                }
            }
        },
        "400": {
            "description": "路径非法",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "message": {"type": "string"},
                    "data": {"type": "object"},
                    "code": {"type": "integer"}
                },
                "required": ["success", "message", "code"]
            },
            "examples": {
                "application/json": {
                    "success": False,
                    "message": "Invalid list path",
                    "data": None,
                    "code": 400
                }
            }
        },
        "500": {"description": "服务器错误"},
    },
}

file_get_spec = {
    "tags": ["Files"],
    "parameters": [
        {"in": "query", "name": "path", "type": "string", "required": False, "description": "目标路径"},
    ],
    "responses": {
        "200": {
            "description": "成功返回目录结构",
            "schema": {
                "type": "object",
                "properties": {
                    "storages": {"type": "array", "items": {"type": "string"}},
                    "adapter": {"type": "string"},
                    "dirname": {"type": "string"},
                    "files": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "basename": {"type": "string"},
                                "extension": {"type": "string"},
                                "extra_metadata": {"type": "array", "items": {"type": "object"}},
                                "last_modified": {"type": "integer"},
                                "path": {"type": "string"},
                                "type": {"type": "string", "enum": ["dir", "file"]},
                                "visibility": {"type": "string"},
                                "file_size": {"type": "integer"},
                                "mime_type": {"type": "string"},
                                "url": {"type": "string"}
                            },
                            "required": ["basename", "extension", "last_modified", "path", "type", "visibility"]
                        }
                    }
                },
                "required": ["storages", "adapter", "dirname", "files"]
            },
            "examples": {
                "application/json": {
                    "storages": ["local"],
                    "adapter": "local",
                    "dirname": "/abs/path/backend/uploads",
                    "files": [
                        {"basename": "folder1", "extension": "", "extra_metadata": [], "last_modified": 1710000100, "path": "/abs/path/backend/uploads/folder1", "type": "dir", "visibility": "public"},
                        {"basename": "file.wav", "extension": ".wav", "extra_metadata": [], "last_modified": 1710000200, "path": "/abs/path/backend/uploads/file.wav", "type": "file", "visibility": "public", "file_size": 1234, "mime_type": "audio/wav", "url": ""}
                    ]
                }
            }
        },
        "400": {
            "description": "请求错误",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "message": {"type": "string"},
                    "data": {"type": "object"},
                    "code": {"type": "integer"}
                },
                "required": ["success", "message", "code"]
            }
        },
    },
}


file_makedir_spec = {
    "tags": ["Files"],
    "consumes": ["application/json"],
    "parameters": [
        {"in": "query", "name": "path", "type": "string", "required": False, "description": "目标路径"},
        {
            "in": "body",
            "name": "body",
            "required": True,
            "schema": {"type": "object", "properties": {"name": {"type": "string", "description": "新建文件夹名称"}}},
        },
    ],
    "responses": {
        "200": {
            "description": "创建成功",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "message": {"type": "string"}
                },
                "required": ["success", "message"]
            },
            "examples": {
                "application/json": {
                    "success": True,
                    "message": "文件夹 demo 已经创建: /abs/path/backend/uploads/demo"
                }
            }
        },
        "400": {
            "description": "请求错误",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "message": {"type": "string"},
                    "data": {"type": "object"},
                    "code": {"type": "integer"}
                },
                "required": ["success", "message", "code"]
            }
        },
        "500": {"description": "服务器错误"},
    },
}


path_check_spec = {
    "tags": ["Files"],
    "parameters": [
        {"in": "query", "name": "path", "type": "string", "required": False, "description": "目标路径"},
    ],
    "responses": {
        "200": {
            "description": "成功返回存在性检查",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "exists": {"type": "boolean"},
                            "has_data": {"type": "boolean"}
                        },
                        "required": ["exists", "has_data"]
                    },
                    "message": {"type": "string"}
                },
                "required": ["success", "data"]
            },
            "examples": {
                "application/json": {
                    "success": True,
                    "data": {"exists": True, "has_data": False},
                    "message": "路径检测完成"
                }
            }
        },
    },
}