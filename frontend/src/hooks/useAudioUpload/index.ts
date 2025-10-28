/*
 * @Author: mulingyuer
 * @Date: 2025-10-15 09:21:42
 * @LastEditTime: 2025-10-28 15:28:34
 * @LastEditors: mulingyuer
 * @Description: 音频上传 Hook
 * @FilePath: \frontend\src\hooks\useAudioUpload\index.ts
 * 怎么可能会有bug！！！
 */

import type { UploadRequestOptions } from "element-plus";
import type {
	AudioUploadConfig,
	UploadFileData,
	UploadFileResult,
	UploadState,
	ValidateFileResult
} from "./types";
export type * from "./types";
import { uploadFile as uploadFileApi } from "@/api/common";
import { validateMimeType } from "@/utils/tools";
import { useSettingsStore } from "@/stores";

export function useAudioUpload(config: AudioUploadConfig = {}) {
	const settingsStore = useSettingsStore();
	const {
		uploadPath = "/root/audio-upload",
		maxSize = 50, // 50MB
		accept = ["audio/*"],
		customUpload
	} = config;

	const uploadState = reactive<UploadState>({
		loading: false,
		progress: 0,
		completed: false
	});

	/** 重置状态 */
	const resetState = () => {
		uploadState.loading = false;
		uploadState.progress = 0;
		uploadState.completed = false;
	};

	/** 验证文件 */
	const validateFile = (file: File): ValidateFileResult => {
		// 检查文件大小
		if (file.size > maxSize * 1024 * 1024) {
			return { valid: false, message: `文件大小不能超过 ${maxSize}MB` };
		}

		// 检查文件类型
		const isValidType = accept.some((type) => validateMimeType(file.type, type));

		if (!isValidType) {
			return { valid: false, message: `不支持的文件类型: ${file.type}` };
		}

		return { valid: true };
	};

	/** 上传文件 */
	const uploadFile = async (data: UploadFileData): Promise<UploadFileResult> => {
		const { file, showErrorMessage = true } = data;

		const validResult = validateFile(file);
		if (!validResult.valid) {
			showErrorMessage && ElMessage.error(validResult.message);
			return { success: false, message: validResult.message };
		}

		resetState();
		uploadState.loading = true;

		try {
			let result: UploadFileResult;

			if (customUpload) {
				// 使用自定义上传函数
				result = await customUpload(file, (progress) => {
					uploadState.progress = progress;
				});
			} else {
				// 默认上传逻辑
				result = await defaultUpload(file);
			}

			uploadState.completed = true;
			uploadState.loading = false;

			return result;
		} catch (error: any) {
			uploadState.loading = false;
			uploadState.completed = false;

			const message = error.message || "上传失败";
			showErrorMessage && ElMessage.error(message);

			return { success: false, message };
		}
	};

	/** 默认上传实现 */
	const defaultUpload = async (file: File): Promise<UploadFileResult> => {
		// 数据
		const formData = new FormData();
		formData.append("file", file);
		formData.append("path", settingsStore.appSettings.uploadPath);

		// api
		const result = await uploadFileApi(formData, (progressEvent) => {
			if (!progressEvent) return;
			const value = progressEvent.progress ?? 0;
			uploadState.progress = Math.floor(value * 100);
		});

		return {
			success: true,
			fileName: result.filename,
			filePath: result.file_path
		};
	};

	/** Element Plus 上传处理
	 * 用于替换Element Plus 上传组件的默认上传处理逻辑
	 */
	const handleUpload = async (options: UploadRequestOptions): Promise<UploadFileResult | void> => {
		const { file, onError } = options;

		try {
			const result = await uploadFile({ file: file });

			// 上传失败
			if (!result.success) {
				onError({
					message: result.message || "上传失败",
					name: "UploadError",
					status: 500,
					method: "POST",
					url: uploadPath
				});
				return;
			}

			// 上传成功
			return result;
		} catch (error) {
			// TODO: 目前是瞎编的
			onError({
				message: (error as Error).message || "上传失败",
				name: (error as Error).name || "UploadError",
				status: 500,
				method: "POST",
				url: uploadPath
			});
		}

		// onError({
		// 	message: "Element Plus 上传处理",
		// 	name: "",
		// 	status: 0,
		// 	method: "",
		// 	url: ""
		// });

		// try {
		// 	const result = await uploadFile({ file: file });
		// 	if (typeof result.filePath === "string") {
		// 		onSuccess(result.filePath);
		// 	} else {
		// 		onError({
		// 			message: result.message || "上传失败",
		// 			name: "UploadError",
		// 			status: 500,
		// 			method: "POST",
		// 			url: uploadPath
		// 		});
		// 	}
		// } catch (error: any) {
		// 	onError(error);
		// }
	};

	return {
		uploadState: readonly(uploadState),
		uploadFile,
		handleUpload,
		resetState,
		validateFile
	};
}
