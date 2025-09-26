/*
 * @Author: mulingyuer
 * @Date: 2025-09-25 11:23:11
 * @LastEditTime: 2025-09-25 15:25:26
 * @LastEditors: mulingyuer
 * @Description: 音乐类组件
 * @FilePath: \frontend\src\utils\audio-player\index.ts
 * 怎么可能会有bug！！！
 */
import WaveSurfer from "wavesurfer.js";
import type { WaveSurferOptions } from "wavesurfer.js";
import type { Ref } from "vue";

export interface AudioPlayerOptions extends WaveSurferOptions {
	/** 默认移动时间（快进/后退） */
	defaultSkipTime?: number;
}

type AudioState =
	| "idle" // 空闲
	| "playing" // 播放中
	| "paused" // 暂停中
	| "ended"; // 结束

export class AudioPlayer {
	private wavesurfer: WaveSurfer;
	/** 默认快进时间s */
	private DEFAULT_SKIP_TIME: number;
	/** 当前播放状态 */
	private state = ref<AudioState>("idle");

	constructor(options: AudioPlayerOptions) {
		const { defaultSkipTime = 5, ...wavesurferOptions } = options;
		this.DEFAULT_SKIP_TIME = defaultSkipTime;
		// 实例化
		this.wavesurfer = WaveSurfer.create(wavesurferOptions);
		// 监听事件
		this.wavesurfer.on("finish", () => {
			this.state.value = "ended";
		});
	}

	/** 播放 */
	public play(): void {
		this.state.value = "playing";
		this.wavesurfer.play();
	}

	/** 暂停 */
	public pause(): void {
		this.state.value = "paused";
		this.wavesurfer.pause();
	}

	/** 播放OR暂停 */
	public playPause(): void {
		if (this.wavesurfer.isPlaying()) {
			this.state.value = "paused";
		} else {
			this.state.value = "playing";
		}
		this.wavesurfer.playPause();
	}

	/** 快进（秒） */
	public fastForward(seconds?: number): void {
		this.wavesurfer.skip(seconds ?? this.DEFAULT_SKIP_TIME);
	}

	/** 快退（秒） */
	public rewind(seconds?: number): void {
		this.wavesurfer.skip(-(seconds ?? this.DEFAULT_SKIP_TIME));
	}

	/** 跳转到指定时间 */
	public setCurrentTime(time: number): void {
		this.wavesurfer.seekTo(time);
	}

	/** 获取当前播放时间 */
	public getCurrentTime(): number {
		return this.wavesurfer.getCurrentTime();
	}

	/** 获取总时长 */
	public getDuration(): number {
		return this.wavesurfer.getDuration();
	}

	/** 获取播放状态 */
	public getState(): Ref<AudioState> {
		return this.state;
	}

	/** 是否正在播放 */
	public isPlaying(): boolean {
		return this.state.value === "playing";
	}

	/** 设置音量 (0-1) */
	public setVolume(volume: number): void {
		this.wavesurfer.setVolume(volume);
	}

	/** 获取音量 */
	public getVolume(): number {
		return this.wavesurfer.getVolume();
	}

	/** 获取原始实例 */
	public getWavesurfer(): WaveSurfer {
		return this.wavesurfer;
	}

	/** 销毁 */
	public destroy() {
		this.wavesurfer.destroy();
		this.state.value = "idle";
	}
}
