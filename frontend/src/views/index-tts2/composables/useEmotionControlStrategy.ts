/*
 * @Author: mulingyuer
 * @Date: 2025-10-22 15:28:07
 * @LastEditTime: 2025-10-22 15:36:26
 * @LastEditors: mulingyuer
 * @Description: 情感控制策略 hooks
 * @FilePath: \frontend\src\views\index-tts2\composables\useEmotionControlStrategy.ts
 * 怎么可能会有bug！！！
 */

export function useEmotionControlStrategy() {
	/** 通过key获取到中文解释 */
	function getEmotionControlStrategyName(key?: string) {
		if (!key) return "";

		switch (key) {
			case "same_as_voice":
				return "与参考音频相同";
			case "use_emotion_audio":
				return "使用情感参考音频";
			case "use_emotion_vectors":
				return "使用情感向量";
			case "use_text_description":
				return "使用文本描述控制情感";
			default:
				return "未知情感控制方式";
		}
	}

	/** 通过key获取传递给后端的值 */
	function getEmotionControlStrategyValue(key?: string) {
		if (!key) return "";

		switch (key) {
			case "same_as_voice":
				return "Same as the voice reference";
			case "use_emotion_audio":
				return "Use emotion reference audio";
			case "use_emotion_vectors":
				return "Use emotion vectors";
			case "use_text_description":
				return "Use text description to control emotion";
		}
	}

	return {
		getEmotionControlStrategyName,
		getEmotionControlStrategyValue
	};
}
