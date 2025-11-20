/*
 * @Author: mulingyuer
 * @Date: 2025-11-20 14:50:04
 * @LastEditTime: 2025-11-20 16:52:16
 * @LastEditors: mulingyuer
 * @Description: 角色相关接口
 * @FilePath: \frontend\src\api\roles\index.ts
 * 怎么可能会有bug！！！
 */
import { request } from "@/request";
import type {
	ClearAllRolesResult,
	CreateRoleData,
	CreateRoleResult,
	DeleteRoleData,
	GetRoleListResult,
	UpdateRoleData
} from "./types";
export type * from "./types";

/** 创建角色 */
export function createRole(data: CreateRoleData) {
	return request<CreateRoleResult>({
		url: "/roles/create",
		method: "POST",
		data
	});
}

/** 删除角色 */
export function deleteRole(data: DeleteRoleData) {
	return request<unknown>({
		url: "/roles/delete",
		method: "POST",
		data
	});
}

/** 获取角色列表 */
export function getRoleList() {
	return request<GetRoleListResult>({
		url: "/roles/list",
		method: "GET"
	});
}

/** 更新角色 */
export function updateRole(data: UpdateRoleData) {
	return request<unknown>({
		url: "/roles/update",
		method: "POST",
		data
	});
}

/** 清空所有角色 */
export function clearAllRoles() {
	return request<ClearAllRolesResult>({
		url: "/roles/clear",
		method: "POST"
	});
}
