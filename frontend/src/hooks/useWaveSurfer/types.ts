/*
 * @Author: mulingyuer
 * @Date: 2025-10-13 15:35:57
 * @LastEditTime: 2025-10-13 15:58:33
 * @LastEditors: mulingyuer
 * @Description: types
 * @FilePath: \frontend\src\hooks\useWaveSurfer\types.ts
 * 怎么可能会有bug！！！
 */
import type { WaveSurferOptions } from "wavesurfer.js";
import WaveSurfer from "wavesurfer.js";

export type WaveSurferInstance = WaveSurfer;

/** 波形颜色配置 */
export type WaveColorConfig = Required<
	Pick<WaveSurferOptions, "waveColor" | "progressColor" | "cursorColor">
>;
export type WaveSurferThemeKey = "light" | "dark";
export type WaveSurferTheme = Record<WaveSurferThemeKey, WaveColorConfig>;
