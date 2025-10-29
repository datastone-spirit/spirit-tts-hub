/*
 * @Author: mulingyuer
 * @Date: 2025-10-15 09:40:33
 * @LastEditTime: 2025-10-29 10:23:08
 * @LastEditors: mulingyuer
 * @Description: 音频上传 Hook 类型
 * @FilePath: \frontend\src\hooks\useAudioUpload\types.ts
 * 怎么可能会有bug！！！
 */

import type { UploadRawFile, UploadUserFile } from "element-plus";

/** hooks 配置 */
export interface AudioUploadConfig {
	/** 上传路径，该选项会覆盖全局的 **文件上传保存路径** */
	uploadPath?: string;
	/** 最大文件大小 MB */
	maxSize?: number;
	/** 允许的文件类型 */
	accept?: string[];
	/** 自定义上传函数 */
	customUpload?: (
		file: UploadRawFile,
		onProgress?: (progress: number) => void
	) => Promise<UploadUserFile>;
}

/** 上传状态数据 */
export interface UploadState {
	/** 上传中 */
	loading: boolean;
	/** 上传进度 0-100 */
	progress: number;
	/** 上传完成 */
	completed: boolean;
}

/** 文件验证结果 */
export type ValidateFileResult = { valid: true } | { valid: false; message: string };

/** 上传文件参数 */
export interface UploadFileData {
	/** 文件 */
	file: UploadRawFile;
	/** 是否显示错误消息弹窗，默认：true */
	showErrorMessage?: boolean;
}

/** 上传文件结果 */
export type UploadFileResult =
	| {
			success: true;
			data: UploadUserFile;
	  }
	| {
			success: false;
			message: string;
	  };
