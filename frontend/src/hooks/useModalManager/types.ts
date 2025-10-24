/*
 * @Author: mulingyuer
 * @Date: 2025-10-24 15:11:33
 * @LastEditTime: 2025-10-24 15:48:36
 * @LastEditors: mulingyuer
 * @Description: 全局弹窗管理 hooks 类型
 * @FilePath: \frontend\src\hooks\useModalManager\types.ts
 * 怎么可能会有bug！！！
 */

/** 文件选择器类型 */
export type FileDialogType =
	| "file" // 文件
	| "directory" // 目录
	| "both"; // 文件和目录

/** 文件选择器数据 */
export interface FileDialogData {
	/** 是否显示 */
	show: boolean;
	/** 初始路径 */
	path: string;
	/** 类型 */
	type: FileDialogType;
}

/** 显示文件选择器弹窗的参数 */
export interface FileDialogOptions {
	path: string;
	type: "file" | "directory" | "both";
}

export interface DirectoryResult {
	/** 文件夹名 */
	basename: string;
	/** 文件扩展名 */
	extension: string;
	/** 元数据 */
	extra_metadata: Array<any>;
	/** 最后修改时间 s */
	last_modified: number;
	/** 文件夹路径 */
	path: string;
	/** 类型 */
	type: "dir";
	/** 是否可见 */
	visibility: string;
}

export interface FileResult {
	/** 文件名 */
	basename: string;
	/** 文件扩展名 */
	extension: string;
	/** 元数据 */
	extra_metadata: Array<any>;
	/** 最后修改时间 s */
	last_modified: number;
	/** 文件路径 */
	path: string;
	/** 类型 */
	type: "file";
	/** 是否可见 */
	visibility: string;
	/** 文件大小 byte */
	file_size: number;
	/** 文件 MIME 类型 */
	mime_type: string;
}

/** 文件选择器控制器 */
export interface FileDialogController {
	show(options: FileDialogOptions): Promise<any>;
	resolve: ((data: any) => void) | null;
	reject: ((reason?: any) => void) | null;
}
