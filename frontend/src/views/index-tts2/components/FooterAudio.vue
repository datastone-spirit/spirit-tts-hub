<!--
 * @Author: mulingyuer
 * @Date: 2025-09-25 11:28:14
 * @LastEditTime: 2025-11-04 10:45:45
 * @LastEditors: mulingyuer
 * @Description: 底部音频播放器组件
 * @FilePath: \frontend\src\views\index-tts2\components\FooterAudio.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="footer-audio">
		<div class="footer-audio-left">
			<Icon class="audio-icon" name="ri-music-ai-line" :size="22" />
			<h3 class="audio-title">生成音频</h3>
			<div class="audio-generated-time">
				<Icon name="ri-time-line" />生成耗时：{{ formatDuration(generateTime) }}
			</div>
		</div>

		<div class="footer-audio-center">
			<div v-show="isAudioPath" class="footer-audio-player">
				<div class="audio-progress">
					<div class="audio-played-time">
						{{ AudioHelper.formatDuration(playerData.currentDuration) }}
					</div>
					<div class="progress-container">
						<AudioProgress v-model="playerData.progress" @change="playerControls.progressChange" />
						<div ref="audioRef" class="audio-ref"></div>
					</div>
					<div class="audio-total-time">
						{{ AudioHelper.formatDuration(playerData.totalDuration) }}
					</div>
				</div>

				<div class="audio-control">
					<div class="audio-main-control">
						<RewindButton @click="onRewind" />
						<PlayPauseButton
							:isPlaying="isPlaying"
							play-icon-name="ri-play-circle-fill"
							pause-icon-name="ri-pause-circle-fill"
							@click="onPlayPause"
						/>
						<SkipButton @click="onFastForward" />
					</div>
					<div class="audio-other">
						<el-button type="primary" :icon="RiDownloadLine" circle text @click="onDownloadAudio" />
					</div>
				</div>
			</div>
		</div>

		<div class="footer-audio-right">
			<el-button class="footer-button reset" :disabled="loading" @click="$emit('reset-form')">
				重置表单
			</el-button>
			<el-button
				class="footer-button submit"
				type="primary"
				:loading="loading"
				:icon="RiMusicAiFill"
				@click="$emit('submit-form')"
			>
				生成语音
			</el-button>
		</div>

		<div
			v-show="showProgress"
			class="footer-audio-progress"
			:style="{ width: `${progress}%` }"
		></div>
	</div>
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";
import { AudioHelper, useWaveSurferPlayer, type WaveSurferInstance } from "@/hooks/useWaveSurfer";
import { getEnv } from "@/utils/env";
import { downloadFile } from "@/utils/tools";
import AudioProgress from "./AudioProgress.vue";

export interface FooterAudioProps {
	/** 音频路径 */
	audioPath: string;
	/** loading */
	loading: boolean;
	/** 是否显示进度条 */
	showProgress?: boolean;
	/** 进度值 0-100 */
	progress?: number;
	/** 生成耗时 */
	generateTime: number;
}

const env = getEnv();
const props = withDefaults(defineProps<FooterAudioProps>(), {
	showProgress: false,
	progress: 30
});
const _emit = defineEmits<{
	/** 重置表单 */
	"reset-form": [];
	/** 提交表单 */
	"submit-form": [];
}>();

// 图标定义
const RiDownloadLine = useIcon({ name: "ri-download-line", size: 22 });
const RiMusicAiFill = useIcon({ name: "ri-music-ai-fill", size: 16 });

const audioRef = useTemplateRef<HTMLDivElement>("audioRef");
let playerInstance: WaveSurferInstance | undefined;
const { initPlayer, destroyPlayer, playerControls, playerData, state, getPreviewPath } =
	useWaveSurferPlayer();
const isPlaying = computed(() => state.value === "playing");
const isAudioPath = computed(() => {
	return typeof props.audioPath === "string" && props.audioPath.trim() !== "";
});

// 格式化时间
// 如果不足1分钟只显示秒
// 最大单位为分钟
function formatDuration(millisecond: number) {
	if (typeof millisecond !== "number" || millisecond <= 0) return `0s`;

	const totalSeconds = Math.floor(millisecond / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	if (minutes === 0) {
		return `${seconds}s`;
	} else {
		return `${minutes}m${seconds}s`;
	}
}

// 音频控制
function onRewind() {
	playerControls.rewind();
}
function onPlayPause() {
	playerControls.playPause();
}
function onFastForward() {
	playerControls.skip();
}
/** 下载音频 */
function onDownloadAudio() {
	if (!isAudioPath.value) return;
	const url = `${env.VITE_APP_API_BASE_URL}/tts/download?filepath=${encodeURIComponent(props.audioPath)}`;
	downloadFile(url);
}

/** 监听音频路径变化 */
watchEffect(() => {
	if (props.audioPath && playerInstance) {
		playerControls.loadAudio(getPreviewPath(props.audioPath));
	}
});

onMounted(() => {
	if (!audioRef.value) return;

	let url = "";
	if (typeof props.audioPath === "string" && props.audioPath.trim() !== "") {
		url = getPreviewPath(props.audioPath);
	}

	playerInstance = initPlayer({
		container: audioRef.value,
		url
	});
});

onUnmounted(() => {
	destroyPlayer();
});
</script>

<style lang="scss" scoped>
.footer-audio {
	height: 100%;
	padding: $zl-padding;
	display: flex;
	gap: $zl-padding;
	position: relative;
	z-index: 1;
}
.footer-audio-left {
	flex-shrink: 0;
	min-width: 150px;
	.audio-icon {
		color: var(--el-color-primary);
		margin-bottom: 10px;
	}
	.audio-title {
		font-size: 16px;
		font-weight: bold;
		color: var(--el-text-color-primary);
	}
	.audio-generated-time {
		margin-top: 3px;
		font-size: 14px;
		color: var(--el-text-color-secondary);
		display: flex;
		align-items: center;
		gap: 2px;
	}
}
.footer-audio-center {
	flex-grow: 1;
	min-width: 0;
	display: flex;
}
.footer-audio-player {
	flex-grow: 1;
	max-width: 900px;
	margin: auto;
}
.audio-progress {
	display: flex;
	align-items: center;
}
.audio-played-time,
.audio-total-time {
	flex-shrink: 0;
	font-size: 12px;
	color: var(--el-text-color-primary);
}
.audio-played-time {
	margin-right: 24px;
}
.audio-total-time {
	margin-left: 24px;
}
.progress-container {
	flex-grow: 1;
	min-width: 0;
	.audio-ref {
		display: none;
	}
	.audio-slider {
		:deep(.el-slider__button-wrapper) {
			display: none;
		}
	}
}
.audio-control {
	margin-top: 8px;
	display: flex;
	align-items: center;
	gap: 12px;
}
.audio-main-control {
	flex-grow: 1;
	min-width: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 20px;
}
.audio-other {
	flex-shrink: 0;
}
.footer-audio-right {
	flex-shrink: 0;
	height: 100%;
}
.footer-button {
	height: 100%;
}
.footer-audio-progress {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	width: 200px;
	background-color: var(--zl-footer-audio-progress-bg);
	transition: width 0.6s ease;
	animation: van-skeleton-blink 1.2s ease-in-out infinite;
	z-index: -1;
}
@keyframes van-skeleton-blink {
	50% {
		opacity: 0.6;
	}
}
</style>
