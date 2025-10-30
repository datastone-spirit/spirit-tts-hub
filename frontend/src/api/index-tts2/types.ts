/*
 * @Author: mulingyuer
 * @Date: 2025-10-28 15:55:31
 * @LastEditTime: 2025-10-30 15:50:23
 * @LastEditors: mulingyuer
 * @Description: index-tts2 接口类型
 * @FilePath: \frontend\src\api\index-tts2\types.ts
 * 怎么可能会有bug！！！
 */

import type { EMO_CONTROL_METHOD } from "./constants";

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

/** 文本转语音参数 */
export interface TextToSpeechData {
	/** 启用 GPT-2 采样，默认：true */
	do_sample: boolean;
	/** 情感控制方式：0=与音色参考相同，1=情感参考音频，2=情感向量控制，3=情感描述文本，默认：0 */
	emo_control_method: EMO_CONTROL_METHOD;
	/** 是否启用随机情绪采样，默认：false */
	emo_random: boolean;
	/** 情感参考音频文件路径（当 emo_control_method=3 时生效） */
	emo_ref_path: string;
	/** 外部情感强度权重（0.0-1.0），默认：0.8 */
	emo_weight: number;
	/** 长度惩罚系数，默认：0 */
	length_penalty: number;
	/** 最大 mel 令牌数 50-1810，默认：1500 */
	max_mel_tokens: number;
	/** 文本分段的最大 token 数量，默认：120（gen_single.max_text_tokens_per_segment） */
	max_text_tokens_per_segment: number;
	/** Beam Search 的 beam 数 1-10，默认：3 */
	num_beams: number;
	/** 情感描述文本（当 emo_control_method=3 时生效；留空将回退为主文本描述） */
	prompt: string;
	/** 重复惩罚系数，默认：10 */
	repetition_penalty: number;
	/** 音色参考音频文件路径（gen_single.prompt → tts.infer(spk_audio_prompt)） */
	spk_audio_prompt: string;
	/** 采样温度 0.1-2，默认：0.8 */
	temperature: number;
	/** 需要合成的原始文本内容 */
	text: string;
	/** TopK 0-100，默认：30；当值≤0时视为关闭（可传 null） */
	top_k: number;
	/** 核采样 TopP 0-1，默认：0.8 */
	top_p: number;
	/** 情绪向量1：喜（0-1）, 默认：0 */
	vec1: number;
	/** 情绪向量2：怒（0-1）, 默认：0 */
	vec2: number;
	/** 情绪向量3：哀（0-1）, 默认：0 */
	vec3: number;
	/** 情绪向量4：惧（0-1）, 默认：0 */
	vec4: number;
	/** 情绪向量5：厌恶（0-1）, 默认：0 */
	vec5: number;
	/** 情绪向量6：低落（0-1）, 默认：0 */
	vec6: number;
	/** 情绪向量7：惊喜（0-1）, 默认：0 */
	vec7: number;
	/** 情绪向量8：平静（0-1）, 默认：0 */
	vec8: number;
	/** 历史数据 */
	raw_data: string;
}

/** 文本转语音结果 */
export interface TextToSpeechResult {
	/** 音频文件路径 */
	audio_path: string;
}

/** 历史记录结果 */
export interface TTSHistoryResult {
	/** 记录列表 */
	records: Array<{
		/** 文件路径 */
		history_path: string;
		/** id */
		id: string;
		/** 记录的数据，json字符串 */
		input_config_raw: string;
		/** 状态 */
		status: string;
	}>;
	/** 总数量 */
	total: number;
}

/** 删除历史记录参数 */
export interface TTSHistoryDeleteParams {
	/** 是否删除全部 */
	all?: boolean;
	/** 指定要删除的路径 */
	path?: string;
}

/** 删除历史记录结果 */
export interface TTSHistoryDeleteResult {
	/** 删除的数量 */
	count: number;
	/** 删除文件名数组 */
	deleted: string[];
}
