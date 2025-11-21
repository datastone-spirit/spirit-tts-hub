role_create_spec = {
    "tags": ["Roles"],
    "consumes": ["application/json"],
    "parameters": [
        {
            "in": "body",
            "name": "body",
            "required": True,
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "角色名称"},
                    "config": {"type": "string", "description": "角色配置"}
                },
                "required": ["name", "config"],
                "example": {"name": "管理员", "config": ""}
            }
        }
    ],
    "responses": {
        "200": {
            "description": "角色创建成功",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "data": {"type": "object"},
                    "message": {"type": "string"}
                },
                "required": ["success", "data"]
            }
        },
        "400": {"description": "参数缺失"},
        "500": {"description": "服务器错误"}
    }
}

role_update_spec = {
    "tags": ["Roles"],
    "consumes": ["application/json"],
    "parameters": [
        {
            "in": "body",
            "name": "body",
            "required": True,
            "schema": {
                "type": "object",
                "properties": {
                    "id": {"type": "string", "description": "角色ID"},
                    "name": {"type": "string", "description": "角色名称"},
                    "config": {"type": "string", "description": "角色配置"}
                },
                "required": ["id", "name", "config"],
                "example": {"id": "abc123", "name": "管理员", "config": ""}
            }
        }
    ],
    "responses": {
        "200": {"description": "角色更新成功"},
        "400": {"description": "参数缺失"},
        "404": {"description": "角色不存在"},
        "500": {"description": "服务器错误"}
    }
}

role_delete_spec = {
    "tags": ["Roles"],
    "consumes": ["application/json"],
    "parameters": [
        {
            "in": "body",
            "name": "body",
            "required": True,
            "schema": {
                "type": "object",
                "properties": {
                    "id": {"type": "string", "description": "角色ID"}
                },
                "required": ["id"],
                "example": {"id": "abc123"}
            }
        }
    ],
    "responses": {
        "200": {"description": "角色删除成功"},
        "400": {"description": "参数缺失"},
        "404": {"description": "角色不存在"},
        "500": {"description": "服务器错误"}
    }
}

role_list_spec = {
    "tags": ["Roles"],
    "responses": {
        "200": {
            "description": "成功返回角色列表",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "roles": {"type": "array", "items": {"type": "object"}}
                        },
                        "required": ["roles"]
                    },
                    "message": {"type": "string"}
                },
                "required": ["success", "data"]
            }
        }
    }
}

role_clear_spec = {
    "tags": ["Roles"],
    "responses": {
        "200": {
            "description": "清空所有角色成功",
            "schema": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "deleted_count": {"type": "integer"}
                        },
                        "required": ["deleted_count"]
                    },
                    "message": {"type": "string"}
                },
                "required": ["success", "data"]
            }
        },
        "500": {"description": "服务器错误"}
    }
}