/*
 * @Author: mulingyuer
 * @Date: 2025-10-16 11:40:33
 * @LastEditTime: 2025-10-20 10:20:34
 * @LastEditors: mulingyuer
 * @Description: index tts2 类型
 * @FilePath: \frontend\src\views\index-tts2\types.ts
 * 怎么可能会有bug！！！
 */

/** 表单 */
export interface RuleForm {
	/** 参考音频文件路径（用于音色克隆等） */
	referenceAudioPath: string;
	/** 需要合成的原始文本内容 */
	text: string;
	/** 文本分段的最大 token 数量，默认：120 */
	maxTokensPerSegment: number;
	/** 情感控制策略，默认："same_as_voice" */
	emotionControlStrategy: string;
	/** 情感参考音频文件路径（当 emotionControlStrategy 为 "use_emotion_audio" 时生效） */
	emotionReferenceAudioPath: string;
	/**
	 * 外部情感（如参考音频或指定情绪）的强度权重（0.0 - 1.0）。
	 * 仅在 emotionControlStrategy 为 "reference_audio"、"custom_emotion" 等支持外部输入的模式下生效。
	 * 默认值：0.8
	 */
	externalEmotionStrength: number;
	/** 是否启用随机情绪采样，默认：false */
	enableRandomEmotion: boolean;
	/** 各情绪维度的强度权重（每个值范围 0.0 - 1.0），仅在 emotionControlStrategy 为 "use_emotion_vectors" 时生效 */
	emotionStrengths: {
		/** 快乐 0-1，默认0 */
		happy: number;
		/** 生气 0-1，默认0 */
		angry: number;
		/** 难过 0-1，默认0 */
		sad: number;
		/** 害怕 0-1，默认0 */
		afraid: number;
		/** 厌恶 0-1，默认0 */
		disgusted: number;
		/** 忧郁 0-1，默认0 */
		melancholic: number;
		/** 惊讶 0-1，默认0 */
		surprised: number;
		/** 平静 0-1，默认0 */
		calm: number;
	};
	/** 情感描述，仅在 emotionControlStrategy 为 "use_text_description" 时生效 */
	emotionDescription: string;
}
