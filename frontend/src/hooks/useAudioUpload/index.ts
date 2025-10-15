/*
 * @Author: mulingyuer
 * @Date: 2025-10-15 09:21:42
 * @LastEditTime: 2025-10-15 15:19:38
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

export function useAudioUpload(config: AudioUploadConfig = {}) {
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
		const isValidType = accept.some((type) => {
			if (type === "audio/*") return file.type.startsWith("audio/");
			return file.type === type;
		});

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
			return { filePath: null, message: validResult.message };
		}

		resetState();
		uploadState.loading = true;

		try {
			let filePath: string;

			if (customUpload) {
				// 使用自定义上传函数
				filePath = await customUpload(file, (progress) => {
					uploadState.progress = progress;
				});
			} else {
				// 默认上传逻辑
				filePath = await defaultUpload(file);
			}

			uploadState.completed = true;
			uploadState.loading = false;

			return { filePath };
		} catch (error: any) {
			uploadState.loading = false;
			uploadState.completed = false;

			const message = error.message || "上传失败";
			showErrorMessage && ElMessage.error(message);

			return { filePath: null, message };
		}
	};

	/** 默认上传实现 */
	const defaultUpload = async (file: File): Promise<string> => {
		console.log("🚀 ~ defaultUpload ~ file:", file);
		return new Promise((resolve) => {
			// 模拟上传进度
			let progress = 0;
			const timer = setInterval(() => {
				progress += Math.random() * 30;
				uploadState.progress = Math.floor(Math.min(progress, 100));

				if (progress >= 100) {
					clearInterval(timer);
					// 模拟返回文件路径
					const mockPath = `/admin/src/assets/audio/j816336nczz00zb3kqzxxnuve3ub5w2.ogg`;
					resolve(mockPath);
				}
			}, 200);
		});
	};

	/** Element Plus 上传处理
	 * 用于替换Element Plus 上传组件的默认上传处理逻辑
	 */
	const handleUpload = async (options: UploadRequestOptions) => {
		const { file, onError } = options;

		try {
			const result = await uploadFile({ file: file });

			// 上传失败
			if (typeof result.filePath !== "string") {
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
			return result.filePath;
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
