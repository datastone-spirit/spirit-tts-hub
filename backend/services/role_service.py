import os
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple


class RoleService:
    """角色服务：每个角色保存在独立 JSON 文件中，文件名为角色ID"""

    def __init__(self):
        role_path = os.getenv('role_path')
        
        self.roles_dir = role_path
        os.makedirs(self.roles_dir, exist_ok=True)

    def _role_path(self, role_id: str) -> str:
        return os.path.join(self.roles_dir, f"{role_id}.json")

    def _load_role(self, role_id: str) -> Optional[Dict[str, Any]]:
        path = self._role_path(role_id)
        if not os.path.isfile(path):
            return None
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if not isinstance(data, dict):
                    return None
                return data
        except json.JSONDecodeError:
            return None
        except Exception:
            return None

    def _save_role(self, role_obj: Dict[str, Any]) -> None:
        path = self._role_path(role_obj['id'])
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(role_obj, f, ensure_ascii=False, indent=2)

    # 创建角色
    def create_role(self, name: Optional[str], config: Optional[Dict[str, Any]]) -> Tuple[Optional[Dict[str, Any]], Optional[str], int]:
        if not name or config is None:
            return None, '缺少必要参数: 角色名称(name)或角色配置(config)', 400

        role_id = uuid.uuid4().hex
        created_at = int(datetime.utcnow().timestamp())

        role_obj = {
            'id': role_id,
            'name': name,
            'config': config,
            'created_at': created_at,
        }
        try:
            self._save_role(role_obj)
        except Exception as e:
            return None, str(e), 500
        return role_obj, None, 200

    # 修改角色
    def update_role(self, role_id: Optional[str], name: Optional[str], config: Optional[Dict[str, Any]]) -> Tuple[Optional[Dict[str, Any]], Optional[str], int]:
        if not role_id or name is None or config is None:
            return None, '缺少必要参数: id、name、config', 400
        # 进一步校验 name 和 config 非空
        if isinstance(name, str) and name.strip() == '':
            return None, '角色名称不能为空', 400
        if isinstance(config, str) and config.strip() == '':
            return None, '角色配置不能为空', 400
        cur = self._load_role(role_id)
        if cur is None:
            return None, '角色不存在', 404
        cur['name'] = name
        cur['config'] = config
        try:
            self._save_role(cur)
        except Exception as e:
            return None, str(e), 500
        return cur, None, 200

    # 删除角色
    def delete_role(self, role_id: Optional[str]) -> Tuple[Optional[Dict[str, Any]], Optional[str], int]:
        if not role_id:
            return None, '缺少必要参数: id', 400
        path = self._role_path(role_id)
        if not os.path.isfile(path):
            return None, '角色不存在', 404
        # 读取用于返回的名称
        removed = self._load_role(role_id) or {'name': None}
        try:
            os.remove(path)
        except Exception as e:
            return None, str(e), 500
        return {'deleted': role_id, 'name': removed.get('name')}, None, 200

    # 查询列表
    def list_roles(self) -> Tuple[List[Dict[str, Any]], Optional[str], int]:
        results: List[Dict[str, Any]] = []
        try:
            for fname in os.listdir(self.roles_dir):
                if not fname.endswith('.json'):
                    continue
                rid = os.path.splitext(fname)[0]
                obj = self._load_role(rid)
                if obj:
                    results.append(obj)
            # 按 created_at 降序排序，最新的在前
            results.sort(key=lambda x: x.get('created_at', 0), reverse=True)
        except Exception:
            pass
        return results, None, 200

    # 清空所有角色
    def clear_roles(self) -> Tuple[Dict[str, Any], Optional[str], int]:
        deleted_count = 0
        try:
            for fname in os.listdir(self.roles_dir):
                if not fname.endswith('.json'):
                    continue
                path = os.path.join(self.roles_dir, fname)
                if os.path.isfile(path):
                    os.remove(path)
                    deleted_count += 1
        except Exception as e:
            return None, str(e), 500
        return {"deleted_count": deleted_count}, None, 200