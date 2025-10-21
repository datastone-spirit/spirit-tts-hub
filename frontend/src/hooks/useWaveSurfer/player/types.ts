/*
 * @Author: mulingyuer
 * @Date: 2025-10-10 15:31:35
 * @LastEditTime: 2025-10-21 17:02:06
 * @LastEditors: mulingyuer
 * @Description: WaveSurfer types
 * @FilePath: \frontend\src\hooks\useWaveSurfer\player\types.ts
 * 怎么可能会有bug！！！
 */
import type { WaveSurferOptions } from "wavesurfer.js";
import type { Ref } from "vue";
import type { WaveSurferThemeKey } from "../types";

/** 音频状态 */
export type AudioState =
	| "idle" // 空闲
	| "playing" // 播放中
	| "paused" // 暂停中
	| "ended"; // 结束

export interface UseWaveSurferOptions {
	/** 可选：波形配置 */
	options?: Partial<WaveSurferOptions>;
	/** 可选：loading */
	loading?: Ref<boolean>;
	/** 可选： 播放状态*/
	state?: Ref<AudioState>;
	/** 可选：是否开启区域选择（剪切） */
	isRegion?: Ref<boolean>;
	/** 可选：跳过多少秒 */
	skipSeconds?: number;
	/** 可选：是否循环播放 */
	loop?: boolean;
}

export interface InitWaveSurferPlayerOptions {
	/** 必需的 DOM 引用 */
	container: WaveSurferOptions["container"];
	/** 音频路径 */
	url: WaveSurferOptions["url"];
	/** 可选：波形配置 */
	options?: Partial<WaveSurferOptions>;
	/** 可选：主题配置 (默认 light) */
	theme?: WaveSurferThemeKey;
	/** 可选：是否循环播放 */
	loop?: boolean;
}

/** 事件类型 */
export type PlayerEventMap = {
	/** 裁剪并上传完成 */
	"region-complete": Blob;
};
