/*
 * @Author: mulingyuer
 * @Date: 2025-10-30 11:15:00
 * @LastEditTime: 2025-10-30 11:15:01
 * @LastEditors: mulingyuer
 * @Description: 常量
 * @FilePath: \frontend\src\api\index-tts2\constants.ts
 * 怎么可能会有bug！！！
 */

/** 情感控制方式枚举 */
export enum EMO_CONTROL_METHOD {
	/** 与音色参考相同 */
	SAME_AS_VOICE = 0,
	/** 情感参考音频 */
	USE_EMOTION_AUDIO = 1,
	/** 情感向量控制 */
	USE_EMOTION_VECTORS = 2,
	/** 情感描述文本 */
	USE_TEXT_DESCRIPTION = 3
}

/** 情感控制方式的中文说明映射 */
export const EMO_CONTROL_METHOD_LABELS: Record<EMO_CONTROL_METHOD, string> = {
	[EMO_CONTROL_METHOD.SAME_AS_VOICE]: "与参考音频相同",
	[EMO_CONTROL_METHOD.USE_EMOTION_AUDIO]: "使用情感参考音频",
	[EMO_CONTROL_METHOD.USE_EMOTION_VECTORS]: "使用情感向量",
	[EMO_CONTROL_METHOD.USE_TEXT_DESCRIPTION]: "使用文本描述控制情感"
};
