/*
 * @Author: mulingyuer
 * @Date: 2025-10-27 11:07:17
 * @LastEditTime: 2025-10-27 11:08:47
 * @LastEditors: mulingyuer
 * @Description: 设置页面路由
 * @FilePath: \frontend\src\router\route-modules\settings.ts
 * 怎么可能会有bug！！！
 */
import type { RouteRecordRaw } from "vue-router";

export default [
	{
		path: "/settings",
		name: "Settings",
		component: () => import("@/views/settings/index.vue"),
		meta: {
			title: "设置",
			auth: "public",
			icon: "ri-settings-3-line",
			isHide: true,
			sort: 1000
		}
	}
] as RouteRecordRaw[];
