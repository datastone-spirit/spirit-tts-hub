/*
 * @Author: mulingyuer
 * @Date: 2025-10-13 11:12:35
 * @LastEditTime: 2025-10-13 17:40:24
 * @LastEditors: mulingyuer
 * @Description: 录音类型
 * @FilePath: \frontend\src\hooks\useWaveSurfer\record\types.ts
 * 怎么可能会有bug！！！
 */

import type { SetRequired } from "type-fest";
import type { WaveSurferOptions } from "wavesurfer.js";
import type { RecordPluginDeviceOptions } from "wavesurfer.js/dist/plugins/record.js";
import type { WaveSurferThemeKey } from "../types";
import type { Ref } from "vue";

/** 录音的状态 */
export type RecordState =
	| "idle" // 空闲
	| "recording" // 录音中
	| "paused" // 暂停
	| "stopped"; // 停止;

export interface UseWaveSurferRecordConfig {
	/** 可选：波形配置 */
	options?: Partial<WaveSurferOptions>;
	/** 可选： 播放状态*/
	state?: Ref<RecordState>;
}

/** 初始化录音参数 */
export interface InitRecordConfig {
	/** 必需的 DOM 引用 */
	container: WaveSurferOptions["container"];
	/** 可选：波形配置 */
	options?: Partial<WaveSurferOptions>;
	/** 可选：主题配置 (默认 light) */
	theme?: WaveSurferThemeKey;
}

/** 开始录音参数 */
export type StartRecordConfig = SetRequired<RecordPluginDeviceOptions, "deviceId">;

/** 事件类型 */
export type EventMap = {
	/** 录音开始 */
	"record-start": void;
	/** 录音暂停 */
	"record-pause": Blob;
	/** 录音恢复 */
	"record-resume": void;
	/** 录音停止 */
	"record-end": Blob;
	/** 录音进度 */
	"record-progress": number;
};
