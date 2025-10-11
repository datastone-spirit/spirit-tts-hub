<!--
 * @Author: mulingyuer
 * @Date: 2025-09-29 15:39:39
 * @LastEditTime: 2025-10-11 14:54:19
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
				{{ AudioHelper.formatDuration(playerData.currentDuration) }}
			</div>
			<div class="audio-player-duration total">
				<span v-show="audioData.isRegion" class="region-total">
					{{ AudioHelper.formatDuration(playerData.regionEnd - playerData.regionStart) }}
				</span>
				<span class="total">{{ AudioHelper.formatDuration(playerData.totalDuration) }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	AudioHelper,
	useWaveSurferPlayer,
	type WaveSurferInstance,
	type WaveSurferThemeKey
} from "@/hooks/useWaveSurferPlayer";
import type { AudioData } from "./types";
import { useAppStore } from "@/stores";
import { useIcon } from "@/hooks/useIcon";

export interface AudioPlayerProps {
	/** 音频文件路径 */
	path: string;
}

// icon
const RiCloseFill = useIcon({ name: "ri-close-fill", size: 14 });

const props = defineProps<AudioPlayerProps>();
const emit = defineEmits<{
	/** 清空数据 */
	clear: [];
}>();
const audioData = defineModel("audioData", { type: Object as PropType<AudioData>, required: true });
const appStore = useAppStore();

const waveformRef = useTemplateRef<HTMLDivElement>("waveformRef");
let playerInstance: WaveSurferInstance | undefined;
const { initPlayer, destroyPlayer, toggleTheme, playerData, playerControls, regionControls } =
	useWaveSurferPlayer({
		loading: toRef(audioData.value, "loading"),
		state: toRef(audioData.value, "state"),
		isRegion: toRef(audioData.value, "isRegion"),
		loop: false
	});

/** 监听主题 */
watchEffect(() => {
	if (!playerInstance) return;
	const theme: WaveSurferThemeKey = appStore.isDark ? "dark" : "light";
	toggleTheme(theme);
});

/** 监听音频path变化 */
watchEffect(() => {
	const isPath = typeof props.path === "string" && props.path.trim().length > 0;
	if (isPath) {
		audioData.value.loading = true;
		playerInstance?.load(props.path);
	}
});

onMounted(() => {
	if (!waveformRef.value) return;
	playerInstance = initPlayer({
		container: waveformRef.value,
		url: props.path,
		theme: appStore.isDark ? "dark" : "light"
	});
});

onUnmounted(() => {
	destroyPlayer();
});

// 清理
function onAudioPlayerClear() {
	regionControls.deleteRegion();
	playerControls.stop();

	audioData.value.loading = true;
	emit("clear");
}

// 对外API
defineExpose({
	/** 快退 */
	rewind: () => playerControls.rewind(),

	/** 播放/暂停切换 */
	playPause: () => playerControls.playPause(),

	/** 快进 */
	fastForward: () => playerControls.fastForward(),

	/** 添加区域（region）
	 * 默认截取三分一长度
	 */
	addRegion: () => regionControls.addRegion(),

	/** 删除区域 */
	deleteRegion: () => regionControls.deleteRegion(),

	/** 裁剪 */
	cut: () => regionControls.cut(),

	/** 还原 */
	restore: () => regionControls.restore()
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
	z-index: 2;
}
.audio-player-waveform {
	height: 100%;
	position: relative;
	z-index: 1;
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
