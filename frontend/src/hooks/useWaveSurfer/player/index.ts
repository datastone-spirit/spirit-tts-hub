/*
 * @Author: mulingyuer
 * @Date: 2025-10-10 15:29:57
 * @LastEditTime: 2025-10-30 16:17:41
 * @LastEditors: mulingyuer
 * @Description: WaveSurfer hooks
 * @FilePath: \frontend\src\hooks\useWaveSurfer\player\index.ts
 * 怎么可能会有bug！！！
 */
import { ElMessage } from "element-plus";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import { DEFAULT_OPTIONS, WAVE_SURFER_THEME } from "../constant";
import { AudioHelper } from "../helper";
import type { WaveSurferThemeKey } from "../types";
import type {
	AudioState,
	PlayerEventMap,
	InitWaveSurferPlayerOptions,
	UseWaveSurferOptions
} from "./types";
export * from "../helper";
export type * from "./types";
import mitt from "mitt";
import { getEnv } from "@/utils/env";

// 常量
const DEFAULT_SKIP_SECONDS = 5;
const RESET_DELAY = 500; // 播放结束后重置延迟时间（毫秒）

export function useWaveSurferPlayer(config?: UseWaveSurferOptions) {
	const env = getEnv();
	const useDefaultOptions = config?.options;
	const SKIP_SECONDS = config?.skipSeconds ?? DEFAULT_SKIP_SECONDS;

	let waveSurfer: WaveSurfer | undefined = void 0;
	let regions: RegionsPlugin | undefined = void 0;
	let resetTimer: number | undefined = void 0;
	const playerEmitter = mitt<PlayerEventMap>();

	// 状态
	const loading = config?.loading ?? ref(true);
	const state = config?.state ?? ref<AudioState>("idle");
	const isRegion = config?.isRegion ?? ref(false);
	const playerData = reactive({
		/** 当前音频播放时间s */
		currentDuration: 0,
		/** 音频总时长s */
		totalDuration: 0,
		/** 切片开始时间 */
		regionStart: 0,
		/** 切片结束时间 */
		regionEnd: 0,
		/** 进度数据0-100 */
		progress: 0,
		/** 当前主题 */
		theme: "light" as WaveSurferThemeKey,
		/** 循环播放 */
		loop: config?.loop ?? false,
		/** region 在变化 */
		regionChanging: false
	});

	// 方法
	/** 获取音频实例 */
	const getPlayer = () => waveSurfer;
	/** 获取插件实例 */
	const getRegions = () => regions;

	/** 初始化音频播放器 */
	const initPlayer = (config: InitWaveSurferPlayerOptions) => {
		const { container, url, loop } = config;
		if (!container) return;
		if (typeof loop === "boolean") playerData.loop = loop;

		// plugin
		regions = RegionsPlugin.create();
		// theme
		const themeKey: WaveSurferThemeKey = config.theme ?? "light";
		playerData.theme = themeKey;
		const theme = WAVE_SURFER_THEME[themeKey];
		// 状态
		loading.value = true;
		state.value = "idle";
		isRegion.value = false;

		// 创建实例
		waveSurfer = WaveSurfer.create({
			...DEFAULT_OPTIONS,
			normalize: true,
			interact: true,
			dragToSeek: true,
			hideScrollbar: false,
			...(useDefaultOptions ?? {}),
			...(config.options ?? {}),
			...theme,
			container,
			url,
			plugins: [regions]
		});

		// 监听事件
		setupAudioEventListeners();

		return waveSurfer;
	};

	/** 监听事件 */
	const setupAudioEventListeners = () => {
		if (!waveSurfer || !regions) return;

		waveSurfer.on("ready", () => {
			loading.value = false;
			const duration = waveSurfer!.getDuration();
			playerData.totalDuration = duration;
		});

		waveSurfer.on("play", () => {
			if (isRegion.value) {
				waveSurfer!.setTime(playerData.regionStart);
			}
			state.value = "playing";
		});

		waveSurfer.on("pause", () => {
			state.value = "paused";
		});

		waveSurfer.on("timeupdate", () => {
			playerData.currentDuration = waveSurfer!.getCurrentTime();
			playerData.progress = Math.min(
				100,
				Math.floor((playerData.currentDuration / playerData.totalDuration) * 100)
			);

			// 循环/边界处理
			if (isRegion.value && playerData.currentDuration >= playerData.regionEnd) {
				waveSurfer!.pause();
				waveSurfer!.setTime(playerData.regionStart);
			}
		});

		waveSurfer.on("finish", () => {
			if (playerData.loop) {
				waveSurfer?.play();
			} else {
				state.value = "ended";
				// 播放完毕指针归位
				if (resetTimer) clearTimeout(resetTimer);
				resetTimer = setTimeout(() => {
					waveSurfer?.seekTo(0);
					state.value = "idle";
				}, RESET_DELAY);
			}
		});

		// 可选：监听区域点击或播放
		regions.on("region-clicked", (region, e) => {
			e.stopPropagation(); // 防止冒泡
			region.play(); // 点击区域时播放该片段
		});

		regions.on("region-out", () => {
			if (!isRegion.value || playerData.regionChanging) return;
			waveSurfer!.setTime(playerData.regionStart);
			waveSurfer?.play();
		});

		regions.on("region-update", (region, slide) => {
			playerData.regionChanging = true;

			// 防止拖拽到起始自动缩减大小
			if (slide && region.minLength !== 0) {
				region.minLength = 0;
			}
			if (!slide && region.minLength <= 0) {
				region.minLength = region.end - region.start;
			}
		});

		regions.on("region-updated", (region) => {
			playerData.regionStart = region.start;
			playerData.regionEnd = region.end;

			playerData.regionChanging = false;
			region.minLength = 0;
		});
	};

	// 控制方法

	/** 音频控制 */
	const playerControls = {
		/** 播放或暂停 */
		playPause: () => waveSurfer?.playPause(),
		/** 快退 */
		rewind: (skipSeconds?: number) => {
			skipSeconds = skipSeconds ?? SKIP_SECONDS;
			waveSurfer?.skip(-skipSeconds);
		},
		/** 快进 */
		skip: (skipSeconds?: number) => {
			skipSeconds = skipSeconds ?? SKIP_SECONDS;
			waveSurfer?.skip(skipSeconds);
		},
		/** 停止 */
		stop: () => waveSurfer?.stop(),
		/** 进度条变化处理 */
		progressChange: (value: number) => {
			if (!waveSurfer) return;
			const seekPosition = Math.min(value / 100, 1);
			waveSurfer.seekTo(seekPosition);
		},
		/** 加载新的音频 */
		loadAudio: (newPath: string) => {
			if (!waveSurfer) return;

			// 确保清除旧状态
			regionControls.deleteRegion();
			loading.value = true;
			waveSurfer.load(newPath);
		}
	};

	/** 切片控制 */
	const regionControls = {
		/** 添加区域（region）
		 * 默认截取三分一长度
		 */
		addRegion: () => {
			if (!waveSurfer) return;
			isRegion.value = true;
			const duration = waveSurfer!.getDuration();
			const start = duration * 0.25;
			const end = start + duration / 3;
			playerData.regionStart = start;
			playerData.regionEnd = end;

			regions!.addRegion({
				start: start,
				end: end,
				drag: true, // 拖动
				resize: true, // 调整大小
				id: "default-selection"
			});
		},

		/** 删除区域 */
		deleteRegion: () => {
			isRegion.value = false;
			regions?.clearRegions();
		},

		/** 裁剪 */
		cut: () => {
			if (!waveSurfer) return;
			// 获取完整的音频数据
			const audioBuffer = waveSurfer.getDecodedData();
			if (!audioBuffer) {
				ElMessage.warning("音频数据尚未解码完成，请稍后再试。");
				return;
			}

			const trimmedBlob = AudioHelper.cutAudio({
				audioBuffer: audioBuffer,
				start: playerData.regionStart,
				end: playerData.regionEnd
			});

			// 确保 trimmedUint8Array 是一个标准的 Uint8Array，如果它可能由 SharedArrayBuffer 支持，则进行复制
			const compatibleUint8Array = new Uint8Array(trimmedBlob);

			// 将兼容的 Uint8Array 转换为 Blob
			const audioBlob = new Blob([compatibleUint8Array], { type: "audio/wav" });

			// 清理裁剪
			isRegion.value = false;
			regions!.clearRegions();
			waveSurfer.stop();

			return audioBlob;
		},

		/** 清理裁剪 */
		clear: () => {
			isRegion.value = false;
			regions?.clearRegions();
		}
	};

	/** 主题切换 */
	const toggleTheme = (themeKey: WaveSurferThemeKey) => {
		if (playerData.theme === themeKey) return;
		const newTheme = WAVE_SURFER_THEME[themeKey];
		waveSurfer?.setOptions(newTheme);
		playerData.theme = themeKey;
	};

	/** 实例销毁 */
	const destroyPlayer = () => {
		if (waveSurfer) {
			waveSurfer.destroy();
			waveSurfer = void 0;
		}

		if (regions) {
			regions.destroy();
			regions = void 0;
		}

		// 状态清空
		loading.value = false;
		state.value = "idle";
		isRegion.value = false;
	};

	/** 拼接可读取的音频路径 */
	const getPreviewPath = (path: string) => {
		return `${env.VITE_APP_API_BASE_URL}/audio/preview?filename=${encodeURIComponent(path)}`;
	};

	return {
		loading,
		state,
		isRegion,
		playerData,
		playerControls,
		regionControls,
		playerEmitter,
		toggleTheme,
		getPlayer,
		getRegions,
		initPlayer,
		destroyPlayer,
		getPreviewPath
	};
}
