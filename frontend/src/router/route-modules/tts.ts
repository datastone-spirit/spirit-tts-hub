/*
 * @Author: mulingyuer
 * @Date: 2025-09-19 16:21:16
 * @LastEditTime: 2025-10-13 14:25:37
 * @LastEditors: mulingyuer
 * @Description: tts路由模块
 * @FilePath: \frontend\src\router\route-modules\tts.ts
 * 怎么可能会有bug！！！
 */
import type { RouteRecordRaw } from "vue-router";

export default [
	{
		path: "/tts/index-tts2",
		name: "IndexTTS2",
		component: () => import("@/views/index-tts2/index.vue"),
		meta: {
			title: "Index TTS2",
			auth: "public",
			icon: "ri-bilibili-line",
			sort: 10
		}
	}
] as RouteRecordRaw[];
