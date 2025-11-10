/*
 * @Author: mulingyuer
 * @Date: 2025-09-28 15:21:45
 * @LastEditTime: 2025-11-10 14:38:40
 * @LastEditors: mulingyuer
 * @Description: 公共接口
 * @FilePath: \frontend\src\api\common\index.ts
 * 怎么可能会有bug！！！
 */
import { request } from "@/request";
import type {
	CheckDirectoryExistsParams,
	CheckDirectoryExistsResult,
	FileInfoResult,
	UploadFileResult,
	UploadFilesData,
	UploadFilesResult
} from "./types";
import type { AxiosProgressEvent } from "axios";
export type * from "./types";

/** 上传文件 */
export function uploadFiles(data: UploadFilesData) {
	return request<UploadFilesResult>({
		url: "/upload",
		method: "POST",
		params: data.params,
		data: data.files,
		onUploadProgress: data.onUploadProgress,
		timeout: 0 // 永不超时
	});
}

/** 上传单个文件 */
export function uploadFile(
	data: FormData,
	onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) {
	return request<UploadFileResult>({
		url: "/files/upload",
		method: "POST",
		data: data,
		onUploadProgress,
		timeout: 0 // 永不超时
	});
}

/** 获取文件信息 */
export function getFileInfo(path: string) {
	return request<FileInfoResult>({
		url: "/files/file",
		method: "GET",
		params: {
			additionalParam1: "yes",
			path
		},
		data: {
			additionalBody1: ["yes"]
		},
		unpack: false,
		headers: {
			"X-ADDITIONAL-HEADER": "yes"
		}
	});
}

/** 检测目录是否存在 */
export function checkDirectoryExists(params: CheckDirectoryExistsParams) {
	return request<CheckDirectoryExistsResult>({
		url: "/files/path_check",
		method: "GET",
		params
	});
}
