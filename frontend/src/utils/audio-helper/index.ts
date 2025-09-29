/*
 * @Author: mulingyuer
 * @Date: 2025-09-29 10:23:54
 * @LastEditTime: 2025-09-29 15:26:02
 * @LastEditors: mulingyuer
 * @Description: 音乐相关辅助功能
 * @FilePath: \frontend\src\utils\audio-helper\index.ts
 * 怎么可能会有bug！！！
 */
export type * from "./types";
import { audioBufferToWav } from "./audioBufferToWav";
import type { CutAudioOptions } from "./types";

export class AudioHelper {
	/** 格式化时长显示 */
	public static formatDuration(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
	}

	/** 剪切音频 */
	public static cutAudio(options: CutAudioOptions): Uint8Array {
		const { audioBuffer, start, end } = options;

		const audioContext = new AudioContext({
			sampleRate: audioBuffer.sampleRate
		});

		const numberOfChannels = audioBuffer.numberOfChannels;
		const sampleRate = audioBuffer.sampleRate;

		let trimmedLength = audioBuffer.length;
		let startOffset = 0;

		if (typeof start === "number" && typeof end === "number") {
			startOffset = Math.round(start * sampleRate);
			const endOffset = Math.round(end * sampleRate);
			trimmedLength = endOffset - startOffset;
		}

		const trimmedAudioBuffer = audioContext.createBuffer(
			numberOfChannels,
			trimmedLength,
			sampleRate
		);

		for (let channel = 0; channel < numberOfChannels; channel++) {
			const channelData = audioBuffer.getChannelData(channel);
			const trimmedData = trimmedAudioBuffer.getChannelData(channel);
			for (let i = 0; i < trimmedLength; i++) {
				trimmedData[i] = channelData[startOffset + i];
			}
		}

		return audioBufferToWav(trimmedAudioBuffer);
	}
}
