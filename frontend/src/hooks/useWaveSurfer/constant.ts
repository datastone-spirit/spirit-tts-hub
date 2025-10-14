/*
 * @Author: mulingyuer
 * @Date: 2025-10-13 15:35:35
 * @LastEditTime: 2025-10-13 16:37:54
 * @LastEditors: mulingyuer
 * @Description: 常量
 * @FilePath: \frontend\src\hooks\useWaveSurfer\constant.ts
 * 怎么可能会有bug！！！
 */
import type { WaveSurferOptions } from "wavesurfer.js";
import type { WaveSurferTheme } from "./types";

/** 默认waveSurfer配置 */
export const DEFAULT_OPTIONS: Partial<WaveSurferOptions> = {
	height: "auto",
	width: "auto",
	barWidth: 3,
	barGap: 2,
	barRadius: 4,
	cursorWidth: 2,
	sampleRate: 44100
};

/** 主题 */
export const WAVE_SURFER_THEME: WaveSurferTheme = {
	light: {
		waveColor: "rgb(144, 222, 208)",
		progressColor: "#20bda0",
		cursorColor: "#ff4136"
	},
	dark: {
		waveColor: "rgb(28, 138, 118)",
		progressColor: "#20bda0",
		cursorColor: "#ff4136"
	}
};
