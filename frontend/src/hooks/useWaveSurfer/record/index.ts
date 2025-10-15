/*
 * @Author: mulingyuer
 * @Date: 2025-10-13 11:12:11
 * @LastEditTime: 2025-10-15 11:56:58
 * @LastEditors: mulingyuer
 * @Description: 录音
 * @FilePath: \frontend\src\hooks\useWaveSurfer\record\index.ts
 * 怎么可能会有bug！！！
 */
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record";
import { DEFAULT_OPTIONS, WAVE_SURFER_THEME } from "../constant";
import type { WaveSurferThemeKey } from "../types";
import type {
	EventMap,
	InitRecordConfig,
	RecordState,
	StartRecordConfig,
	UseWaveSurferRecordConfig
} from "./types";
export type * from "./types";
import mitt from "mitt";

export function useWaveSurferRecord(config?: UseWaveSurferRecordConfig) {
	const useDefaultOptions = config?.options;

	let waveSurfer: WaveSurfer | undefined = void 0;
	let recordPlugin: RecordPlugin | undefined = void 0;
	const recordEmitter = mitt<EventMap>();

	// 状态
	const state = config?.state ?? ref<RecordState>("idle");
	const recordData = reactive({
		/** 当前主题 */
		theme: "light" as WaveSurferThemeKey,
		/** 录制的时间（s） */
		duration: 0,
		/** 是否取消录制 */
		isCancel: false
	});

	// 方法
	/** 获取音频实例 */
	const getPlayer = () => waveSurfer;
	/** 获取插件实例 */
	const getRecord = () => recordPlugin;
	/** 初始化录音 */
	const initRecord = (config: InitRecordConfig) => {
		const { container } = config;
		if (!container) return;

		// plugin
		recordPlugin = RecordPlugin.create({
			continuousWaveformDuration: 5
		});

		// theme
		const themeKey: WaveSurferThemeKey = config.theme ?? "light";
		recordData.theme = themeKey;
		const theme = WAVE_SURFER_THEME[themeKey];

		waveSurfer = WaveSurfer.create({
			...DEFAULT_OPTIONS,
			interact: true,
			dragToSeek: true,
			hideScrollbar: false,
			...(useDefaultOptions ?? {}),
			...(config.options ?? {}),
			...theme,
			container,
			plugins: [recordPlugin]
		});

		// 监听事件
		setupAudioEventListeners();

		return waveSurfer;
	};

	/** 监听事件 */
	const setupAudioEventListeners = () => {
		if (!waveSurfer || !recordPlugin) return;

		recordPlugin.on("record-start", () => {
			recordData.duration = 0;
			recordEmitter.emit("record-start");
		});

		recordPlugin.on("record-pause", (blob) => {
			recordEmitter.emit("record-pause", blob);
		});

		recordPlugin.on("record-resume", () => {
			recordEmitter.emit("record-resume");
		});

		recordPlugin.on("record-end", (blob) => {
			// 如果是取消录音就忽略
			if (recordData.isCancel) {
				recordData.isCancel = false;
				waveSurfer?.empty();
				return;
			}
			recordEmitter.emit("record-end", blob);
		});

		recordPlugin.on("record-progress", (duration) => {
			recordData.duration = duration;
			recordEmitter.emit("record-progress", duration);
		});
	};

	/** 实例销毁 */
	const destroyRecord = () => {
		if (waveSurfer) {
			waveSurfer.destroy();
			waveSurfer = void 0;
		}

		if (recordPlugin) {
			recordPlugin.destroy();
			recordPlugin = void 0;
		}

		// 状态清空
		state.value = "idle";
	};

	/** 主题切换 */
	const toggleTheme = (themeKey: WaveSurferThemeKey) => {
		if (recordData.theme === themeKey) return;
		const newTheme = WAVE_SURFER_THEME[themeKey];
		waveSurfer?.setOptions(newTheme);
		recordData.theme = themeKey;
	};

	/** 获取录音设备 */
	const getRecordDevice = async () => {
		try {
			// **重要：首次调用 getUserMedia() 之前，设备信息可能是受限或空的。**
			// 最佳实践是先尝试获取一次权限 (尽管我们这里不使用返回的流)
			// 这样可以触发浏览器权限弹窗，后续的 enumerateDevices 才能拿到真实的设备名。
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			stream.getTracks().forEach((track) => track.stop()); // 立即关闭获取到的流

			// 使用插件获取设备更加准备，原生方法获取需要过滤内容
			const devices = await RecordPlugin.getAvailableAudioDevices();

			return devices;
		} catch (error) {
			const message = `获取设备失败，请检查权限和浏览器支持！`;
			ElMessage.error(message);
			console.error(message, error);

			return [];
		}
	};

	/** 开始录音 */
	const startRecord = (config: StartRecordConfig) => {
		if (!waveSurfer) {
			ElMessage.error("请先初始化示波器！");
			return;
		}
		state.value = "recording";
		return recordPlugin?.startRecording(config);
	};

	/** 停止录音 */
	const stopRecord = () => {
		state.value = "stopped";
		recordPlugin?.stopRecording();
	};

	/** 暂停录音 */
	const pauseRecord = () => {
		state.value = "paused";
		recordPlugin?.pauseRecording();
	};

	/** 恢复录音 */
	const resumeRecord = () => {
		state.value = "recording";
		recordPlugin?.resumeRecording();
	};

	/** 重置录音 */
	const resetRecord = () => {
		state.value = "idle";
		recordData.duration = 0;

		waveSurfer?.empty();
	};

	/** 取消录音 */
	const cancelRecord = () => {
		if (["idle", "stopped"].includes(state.value)) return;

		recordData.isCancel = true;
		state.value = "idle";
		recordData.duration = 0;

		recordPlugin?.stopRecording();
	};

	return {
		state,
		recordData,
		recordEmitter,
		getRecordDevice,
		toggleTheme,
		initRecord,
		destroyRecord,
		startRecord,
		stopRecord,
		pauseRecord,
		resumeRecord,
		resetRecord,
		getPlayer,
		getRecord,
		cancelRecord
	};
}
