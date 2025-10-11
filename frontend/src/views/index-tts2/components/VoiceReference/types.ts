/*
 * @Author: mulingyuer
 * @Date: 2025-09-29 10:32:52
 * @LastEditTime: 2025-09-30 11:15:32
 * @LastEditors: mulingyuer
 * @Description: 公共类型
 * @FilePath: \frontend\src\views\index-tts2\components\VoiceReference\types.ts
 * 怎么可能会有bug！！！
 */
import type { AudioState } from "@/hooks/useWaveSurferPlayer";

/** 音频类型 */
export type VoiceType =
	| "upload" // 上传
	| "record"; // 录音

/** 上传相关数据 */
export interface UploadData {
	/** 文件上传后的路径 */
	path: string;
	/** 上传中 */
	loading: boolean;
	/** 上传进度 */
	percentage: number;
	/** 上传结束 */
	isEnd: boolean;
}

/** 音频数据 */
export interface AudioData {
	/** 音频状态 */
	state: AudioState;
	/** 是否开启区域选择 */
	isRegion: boolean;
	/** 文件加载中 */
	loading: boolean;
}
