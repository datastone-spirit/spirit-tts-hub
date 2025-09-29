<!--
 * @Author: mulingyuer
 * @Date: 2025-09-29 15:39:39
 * @LastEditTime: 2025-09-29 17:45:39
 * @LastEditors: mulingyuer
 * @Description: 音频播放
 * @FilePath: \frontend\src\views\index-tts2\components\VoiceReference\AudioPlayer.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="audio-player">
		<div class="audio-player-waveform-container">
			<el-button
				class="audio-player-clear"
				:icon="RiCloseFill"
				size="small"
				@click="onAudioPlayerClear"
			></el-button>
			<div class="audio-player-waveform" ref="waveformRef"></div>
		</div>
		<div class="audio-player-duration-container">
			<div class="audio-player-duration current">
				{{ AudioHelper.formatDuration(waveformData.currentDuration) }}
			</div>
			<div class="audio-player-duration total">
				<span v-show="audioData.isRegion" class="region-total">
					{{ AudioHelper.formatDuration(waveformData.regionEnd - waveformData.regionStart) }}
				</span>
				<span class="total">{{ AudioHelper.formatDuration(waveformData.totalDuration) }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { AudioHelper } from "@/utils/audio-helper";
import WaveSurfer, { type WaveSurferOptions } from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import type { AudioData } from "./types";
import { useAppStore } from "@/stores";
import { useIcon } from "@/hooks/useIcon";

export interface AudioPlayerProps {
	path: string; // 音频文件路径
}
/** 波形颜色配置 */
export type WaveColorConfig = Required<
	Pick<WaveSurferOptions, "waveColor" | "progressColor" | "cursorColor">
>;

// 常量定义
const SKIP_SECONDS = 5; // 快进/快退秒数
const DEFAULT_WAVE_SURFER_OPTIONS: Partial<WaveSurferOptions> = {
	height: "auto",
	width: "auto",
	barWidth: 3, // 稍宽的波形柱，更清晰
	barGap: 2, // 柱子之间的间隙，提升节奏感
	barRadius: 4, // 圆角柱形，更柔和美观
	cursorWidth: 2, // 光标宽度
	normalize: true, // 自动归一化音量，使波形更饱满
	interact: true, // 允许点击波形跳转
	dragToSeek: true, // 拖拽进度（WaveSurfer 7+ 支持）
	hideScrollbar: false, // 显示滚动条（如波形很长）
	sampleRate: 44100 // 采样率
};
const WAVE_SURFER_THEME: Record<"light" | "dark", WaveColorConfig> = {
	light: {
		waveColor: "rgb(144, 222, 208)", // 波形颜色
		progressColor: "#20bda0", // 进度条颜色（更深的，增强对比）
		cursorColor: "#ff4136" // 播放光标颜色
	},
	dark: {
		waveColor: "rgb(28, 138, 118)", // 波形颜色
		progressColor: "#20bda0", // 进度条颜色（更深的，增强对比）
		cursorColor: "#ff4136" // 播放光标颜色
	}
};

// icon
const RiCloseFill = useIcon({ name: "ri-close-fill", size: 14 });

const props = defineProps<AudioPlayerProps>();
const emit = defineEmits<{
	/** 清空数据 */
	clear: [];
}>();
const audioData = defineModel("audioData", { type: Object as PropType<AudioData>, required: true });
const appStore = useAppStore();

const waveformRef = useTemplateRef("waveformRef");
const waveformData = reactive({
	currentDuration: 0,
	totalDuration: 0,
	regionStart: 0, // 切片开始时间
	regionEnd: 0 // 切片结束时间
});
let audio: WaveSurfer | null = null;
let regions: RegionsPlugin | null = null;

// 清理
function onAudioPlayerClear() {
	audio?.empty();
	emit("clear");
}

/** 初始化音频播放器 */
const initializeAudio = () => {
	if (!waveformRef.value) return;

	regions = RegionsPlugin.create();

	const theme = appStore.isDark ? WAVE_SURFER_THEME.dark : WAVE_SURFER_THEME.light;
	audio = WaveSurfer.create({
		...DEFAULT_WAVE_SURFER_OPTIONS,
		...theme,
		container: waveformRef.value,
		url: props.path,
		plugins: [regions]
	});

	setupAudioEventListeners();
};

/** 设置音频事件监听器 */
const setupAudioEventListeners = () => {
	if (!audio) return;

	audio.on("play", () => {
		if (audioData.value.isRegion) {
			audio!.setTime(waveformData.regionStart);
		}
		audioData.value.state = "playing";
	});

	audio.on("pause", () => {
		audioData.value.state = "paused";
	});

	audio.on("ready", () => {
		const duration = audio!.getDuration();
		waveformData.totalDuration = duration;
	});

	audio.on("loading", (percent) => {
		if (percent >= 100) audioData.value.loading = false;
	});

	audio.on("timeupdate", () => {
		waveformData.currentDuration = audio!.getCurrentTime();
	});

	// 可选：监听区域点击或播放
	regions!.on("region-clicked", (region, e) => {
		e.stopPropagation(); // 防止冒泡
		region.play(); // 点击区域时播放该片段
	});

	regions!.on("region-out", () => {
		if (!audioData.value.isRegion) return;
		audio!.setTime(waveformData.regionStart);
	});

	regions!.on("region-updated", (region) => {
		waveformData.regionStart = region.start;
		waveformData.regionEnd = region.end;
	});
};

// 对外API
defineExpose({
	/** 快退 */
	rewind: () => {
		audio?.skip(-SKIP_SECONDS);
	},

	/** 播放/暂停切换 */
	playPause: () => {
		if (!audio) return;
		audio.playPause();
	},

	/** 快进 */
	fastForward: () => {
		audio?.skip(SKIP_SECONDS);
	},

	/** 添加区域（region）
	 * 默认截取三分一长度
	 */
	addRegion: () => {
		if (!audio) return;
		audioData.value.isRegion = true;
		const duration = audio!.getDuration();
		const start = duration * 0.25;
		const end = start + duration / 3;
		waveformData.regionStart = start;
		waveformData.regionEnd = end;

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
		audioData.value.isRegion = false;
		regions!.clearRegions();
	},

	/** 裁剪 */
	cut: () => {
		if (!audio) return;
		// 获取完整的音频数据
		const audioBuffer = audio.getDecodedData();
		if (!audioBuffer) {
			ElMessage.warning("音频数据尚未解码完成，请稍后再试。");
			return;
		}

		const trimmedBlob = AudioHelper.cutAudio({
			audioBuffer: audioBuffer,
			start: waveformData.regionStart,
			end: waveformData.regionEnd
		});

		// 确保 trimmedUint8Array 是一个标准的 Uint8Array，如果它可能由 SharedArrayBuffer 支持，则进行复制
		const compatibleUint8Array = new Uint8Array(trimmedBlob);

		// 将兼容的 Uint8Array 转换为 Blob
		const audioBlob = new Blob([compatibleUint8Array], { type: "audio/wav" });

		// 为 Blob 创建一个 URL
		const audioUrl = URL.createObjectURL(audioBlob);
		// 清理裁剪
		audioData.value.isRegion = false;
		regions!.clearRegions();

		// TODO: 应该调用文件上传，然后更新path，重新加载音频

		// 加载新的音频
		audio.load(audioUrl).then(() => {
			URL.revokeObjectURL(audioUrl);
		});
	},

	/** 还原 */
	restore: () => {
		if (!audio) return;
		audioData.value.isRegion = false;
		regions!.clearRegions();
		audio.load(props.path);
	}
});

watchEffect(() => {
	if (appStore.isDark) {
		audio?.setOptions(WAVE_SURFER_THEME.dark);
	} else {
		audio?.setOptions(WAVE_SURFER_THEME.light);
	}
});
watchEffect(() => {
	const isPath = typeof props.path === "string" && props.path.trim().length > 0;
	if (isPath) {
		audio?.load(props.path);
	}
});

onMounted(() => {
	initializeAudio();
});

onUnmounted(() => {
	if (audio) {
		audio.destroy();
		audio = null;
	}
	regions!.destroy();
	regions = null;
});
</script>

<style lang="scss" scoped>
@use "sass:math";

.audio-player {
	height: var(--voice-reference-content-height);
}
.audio-player-waveform-container {
	border: 1px solid var(--el-border-color);
	border-radius: 6px;
	padding: $zl-padding;
	height: calc(100% - 25px);
	position: relative;
	overflow: hidden;
}
.audio-player-clear {
	position: absolute;
	top: 0;
	right: 0;
	padding: 5px;
	border-top: none;
	border-right: none;
	border-radius: 0 6px 0 6px;
}
.audio-player-waveform {
	height: 100%;
	:deep(::part(region-handle-left)) {
		border-left-color: var(--el-color-warning);
	}
	:deep(::part(region-handle-right)) {
		border-right-color: var(--el-color-warning);
	}
	:deep(::part(default-selection)) {
		background-color: rgba(32, 189, 160, 0.2);
	}
}
.audio-player-duration-container {
	margin-top: 5px;
	height: 20px;
	line-height: 20px;
	padding: 0 math.div($zl-padding, 2);
	display: flex;
	justify-content: space-between;
	font-size: 14px;
	color: var(--el-text-color-regular);
}
.audio-player-duration {
	.region-total {
		color: var(--el-color-primary);
		margin-right: $zl-padding;
	}
}
</style>
