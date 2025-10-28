/*
 * @Author: mulingyuer
 * @Date: 2025-10-28 15:53:59
 * @LastEditTime: 2025-10-28 17:12:27
 * @LastEditors: mulingyuer
 * @Description: index-tts2 接口
 * @FilePath: \frontend\src\api\index-tts2\index.ts
 * 怎么可能会有bug！！！
 */
import { request } from "@/request";
import type { PreviewTextSegmentsData, PreviewTextSegmentsResult } from "./types";
export type * from "./types";

/** 文本分段预览 */
export function previewTextSegments(data: PreviewTextSegmentsData) {
	return request<PreviewTextSegmentsResult>({
		url: "/tts/parse-tokens",
		method: "POST",
		data,
		timeout: 30 * 1000 * 1000 // 30s
	});
}
