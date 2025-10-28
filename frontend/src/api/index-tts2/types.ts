/*
 * @Author: mulingyuer
 * @Date: 2025-10-28 15:55:31
 * @LastEditTime: 2025-10-28 15:58:22
 * @LastEditors: mulingyuer
 * @Description: index-tts2 接口类型
 * @FilePath: \frontend\src\api\index-tts2\types.ts
 * 怎么可能会有bug！！！
 */

/** 文本分段预览参数 */
export interface PreviewTextSegmentsData {
	/** 每段的最大token数 */
	max_text_tokens_per_segment: number;
	/** 需要切分的文本 */
	text: string;
}

/** 文本分段预览结果 */
export interface PreviewTextSegmentsResult {
	segments: Array<{
		/** 序号 */
		index: number;
		/** 内容 */
		content: string;
		/** token数量 */
		token_count: number;
	}>;
}
