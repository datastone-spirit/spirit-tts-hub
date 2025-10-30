/*
 * @Author: mulingyuer
 * @Date: 2025-10-30 11:23:48
 * @LastEditTime: 2025-10-30 11:37:14
 * @LastEditors: mulingyuer
 * @Description: 帮助函数
 * @FilePath: \frontend\src\views\index-tts2\helper.ts
 * 怎么可能会有bug！！！
 */
import { EMO_CONTROL_METHOD, EMO_CONTROL_METHOD_LABELS } from "@/api/index-tts2";

/**
 * 根据情感控制方式枚举值获取对应的中文说明
 */
export function getEmoControlMethodLabel(method?: EMO_CONTROL_METHOD): string {
	if (typeof method !== "number") return "未知控制方式";
	return EMO_CONTROL_METHOD_LABELS[method] ?? "未知控制方式";
}

/** 根据文件完整路径获取文件名 */
export function getFileNameFromPath(path?: string): string {
	if (typeof path !== "string" || path.trim() === "") return "";

	return path.split(/[\\/]/).pop() ?? "未命名文件";
}
