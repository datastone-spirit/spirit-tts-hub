/*
 * @Author: mulingyuer
 * @Date: 2025-09-24 09:51:41
 * @LastEditTime: 2025-09-24 15:15:29
 * @LastEditors: mulingyuer
 * @Description: 帮助页面
 * @FilePath: \frontend\src\router\route-modules\help.ts
 * 怎么可能会有bug！！！
 */
import type { RouteRecordRaw } from "vue-router";

export default [
	{
		path: "/help",
		name: "Help",
		component: () => import("@/views/help/index.vue"),
		meta: {
			title: "帮助",
			auth: "public",
			icon: "ri-question-line",
			isHide: true,
			sort: 20
		}
	}
] as RouteRecordRaw[];
