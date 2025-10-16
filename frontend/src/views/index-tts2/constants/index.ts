/*
 * @Author: mulingyuer
 * @Date: 2025-10-16 14:14:53
 * @LastEditTime: 2025-10-16 15:00:38
 * @LastEditors: mulingyuer
 * @Description: 常量
 * @FilePath: \frontend\src\views\index-tts2\constants\index.ts
 * 怎么可能会有bug！！！
 */

/** 情感控制方法，通过key获取到value */
export const EMOTION_CONTROL_METHODS_VALUE = {
	same_as_voice: "Same as the voice reference",
	use_emotion_audio: "Use emotion reference audio",
	use_emotion_vectors: "Use emotion vectors",
	use_text_description: "Use text description to control emotion"
} as const;
