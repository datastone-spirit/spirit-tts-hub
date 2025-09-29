/*
 * @Author: mulingyuer
 * @Date: 2025-09-28 15:21:45
 * @LastEditTime: 2025-09-28 15:28:33
 * @LastEditors: mulingyuer
 * @Description: 公共接口
 * @FilePath: \frontend\src\api\common\index.ts
 * 怎么可能会有bug！！！
 */
import { request } from "@/request";
import type { UploadFilesData, UploadFilesResult } from "./types";

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
