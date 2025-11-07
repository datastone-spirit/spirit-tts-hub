/*
 * @Author: mulingyuer
 * @Date: 2025-11-07 12:32:16
 * @LastEditTime: 2025-11-07 12:55:48
 * @LastEditors: mulingyuer
 * @Description: 初始化
 * @FilePath: \frontend\src\init\index.ts
 * 怎么可能会有bug！！！
 */
import { getConfig } from "@/api/config";
import { useSettingsStore } from "@/stores";

export async function init() {
	try {
		// 获取配置
		const config = await getConfig();

		const settingsStore = useSettingsStore();
		settingsStore.updateAppSettings(config);
	} catch (error) {
		console.error("初始化失败：", error);
	}
}
