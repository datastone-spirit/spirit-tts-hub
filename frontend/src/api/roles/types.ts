/*
 * @Author: mulingyuer
 * @Date: 2025-11-20 14:50:21
 * @LastEditTime: 2025-11-20 16:53:00
 * @LastEditors: mulingyuer
 * @Description: 角色相关接口类型
 * @FilePath: \frontend\src\api\roles\types.ts
 * 怎么可能会有bug！！！
 */

/** 创建角色参数 */
export interface CreateRoleData {
	/** 角色名称 */
	name: string;
	/** 角色配置 json */
	config: string;
}

/** 创建角色返回值 */
export interface CreateRoleResult {
	/** 角色id */
	id: string;
	/** 角色名称 */
	name: string;
	/** 角色配置 json */
	config: string;
	/** 创建时间 s */
	created_at: number;
}

/** 删除角色参数 */
export interface DeleteRoleData {
	/** 角色id */
	id: string;
}

/** 获取角色列表结果 */
export interface GetRoleListResult {
	roles: Array<{
		/** 角色id */
		id: string;
		/** 角色名称 */
		name: string;
		/** 角色配置 json */
		config: string;
		/** 创建时间 s */
		created_at: number;
	}>;
}

/** 更新角色参数 */
export interface UpdateRoleData {
	/** 角色id */
	id: string;
	/** 角色名称 */
	name: string;
	/** 角色配置 json */
	config: string;
}

/** 清空所有角色返回 */
export interface ClearAllRolesResult {
	/** 删除的数量 */
	deleted_count: number;
}
