from flask import Blueprint, request, jsonify
from flasgger import swag_from
from services.role_service import RoleService
from utils.common import success_res, error_res
from swagger.role_routes_swagger import role_create_spec, role_update_spec, role_delete_spec, role_list_spec, role_clear_spec

roles_bp = Blueprint('roles', __name__)
role_service = RoleService()

@roles_bp.route('/create', methods=['POST'])
@swag_from(role_create_spec)
def create_role():
    """创建角色"""
    data = request.get_json() or {}
    name = data.get('name')
    config = data.get('config')
    result, err, code = role_service.create_role(name, config)
    if err:
        return jsonify(error_res(message=err, code=code))
    return jsonify(success_res(data=result, message='角色创建成功'))


@roles_bp.route('/update', methods=['POST'])
@swag_from(role_update_spec)
def update_role():
    """更新角色"""
    data = request.get_json() or {}
    role_id = data.get('id')
    name = data.get('name')
    config = data.get('config')
    result, err, code = role_service.update_role(role_id, name, config)
    if err:
        return jsonify(error_res(message=err, code=code))
    return jsonify(success_res(data=result, message='角色更新成功'))


@roles_bp.route('/delete', methods=['POST'])
@swag_from(role_delete_spec)
def delete_role():
    """删除角色"""
    data = request.get_json() or {}
    role_id = data.get('id')
    result, err, code = role_service.delete_role(role_id)
    if err:
        return jsonify(error_res(message=err, code=code)), code
    return jsonify(success_res(data=result, message='角色删除成功'))


@roles_bp.route('/list', methods=['GET'])
@swag_from(role_list_spec)
def list_roles():
    """获取角色列表"""
    results, err, code = role_service.list_roles()
    if err:
        return jsonify(error_res(message=err, code=code)), code
    return jsonify(success_res(data={'roles': results}, message='角色列表获取成功'))


@roles_bp.route('/clear', methods=['POST'])
@swag_from(role_clear_spec)
def clear_roles():
    """清空所有角色"""
    result, err, code = role_service.clear_roles()
    if err:
        return jsonify(error_res(message=err, code=code)), code
    return jsonify(success_res(data=result, message='已清空所有角色'))