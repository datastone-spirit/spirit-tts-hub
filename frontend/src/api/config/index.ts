/*
 * @Author: mulingyuer
 * @Date: 2025-11-07 12:26:11
 * @LastEditTime: 2025-11-07 12:50:08
 * @LastEditors: mulingyuer
 * @Description: 配置接口
 * @FilePath: \frontend\src\api\config\index.ts
 * 怎么可能会有bug！！！
 */
import { request } from "@/request";
import type { ConfigResult, UpdateConfigData } from "./types";
export type * from "./types";

/** 获取配置 */
export function getConfig() {
	return request<ConfigResult>({
		url: "/files/config",
		method: "GET"
	});
}

/** 修改配置 */
export function updateConfig(data: UpdateConfigData) {
	return request<ConfigResult>({
		url: "/files/config",
		method: "POST",
		data
	});
}

/** 重置配置 */
export function resetConfig() {
	return request<ConfigResult>({
		url: "/files/config/reset",
		method: "POST"
	});
}
