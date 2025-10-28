/*
 * @Author: mulingyuer
 * @Date: 2025-10-24 15:11:33
 * @LastEditTime: 2025-10-27 16:37:56
 * @LastEditors: mulingyuer
 * @Description: 全局弹窗管理 hooks 类型
 * @FilePath: \frontend\src\hooks\useModalManager\types.ts
 * 怎么可能会有bug！！！
 */
export type { FileResult, DirectoryResult } from "@/api/common";

/** 文件选择器类型 */
export type PathPickerDialogType =
	| "file" // 文件
	| "directory" // 目录
	| "both"; // 文件和目录

/** 文件选择器数据 */
export interface PathPickerDialogData {
	/** 是否显示 */
	show: boolean;
	/** 初始路径 */
	path: string;
	/** 类型 */
	type: PathPickerDialogType;
	/** 文件 MIME 类型 */
	mime_type?: string;
}

/** 显示文件选择器弹窗的参数 */
export type PathPickerDialogOptions = Omit<PathPickerDialogData, "show">;

/** 文件选择器控制器 */
export interface PathPickerDialogController {
	show(options: PathPickerDialogOptions): Promise<any>;
	resolve: ((data: any) => void) | null;
	reject: ((reason?: any) => void) | null;
}
