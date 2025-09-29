/*
 * @Author: mulingyuer
 * @Date: 2025-09-29 10:24:10
 * @LastEditTime: 2025-09-29 14:47:15
 * @LastEditors: mulingyuer
 * @Description: 音乐相关辅助功能类型
 * @FilePath: \frontend\src\utils\audio-helper\types.ts
 * 怎么可能会有bug！！！
 */

/** 音频状态 */
export type AudioState =
	| "idle" // 空闲
	| "playing" // 播放中
	| "paused" // 暂停中
	| "ended"; // 结束

/** 剪切音频参数 */
export interface CutAudioOptions {
	/** audioBuffer */
	audioBuffer: AudioBuffer;
	/** 开始时间s */
	start: number;
	/** 结束时间s */
	end: number;
}
