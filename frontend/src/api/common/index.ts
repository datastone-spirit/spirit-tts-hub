/*
 * @Author: mulingyuer
 * @Date: 2025-09-28 15:21:45
 * @LastEditTime: 2025-10-27 16:39:22
 * @LastEditors: mulingyuer
 * @Description: 公共接口
 * @FilePath: \frontend\src\api\common\index.ts
 * 怎么可能会有bug！！！
 */
import { request } from "@/request";
import type { FileInfoResult, UploadFilesData, UploadFilesResult } from "./types";
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

/** 获取文件信息 */
export function getFileInfo(path: string) {
	return request<FileInfoResult>({
		url: "/file",
		method: "GET",
		params: {
			path
		},
		data: {
			additionalBody1: ["yes"]
		},
		unpack: false
	});
}

// params: {
// 	path: pathPickerDialogData.value.path
// },
// body: { additionalBody1: ["yes"] },
// transformRequest: (req: any) => {
// 	if (req.method === "post") {
// 		refresh();
// 	}
// 	return req;
// },
// xsrfHeaderName: "CSRF-TOKEN"
