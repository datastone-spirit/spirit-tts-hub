<!--
 * @Author: mulingyuer
 * @Date: 2025-09-25 11:28:14
 * @LastEditTime: 2025-10-20 17:04:35
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
		</div>

		<div class="footer-audio-right">
			<div v-show="isAudioPath" class="footer-audio-right-content">
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

			<div class="footer-buttons">
				<el-button :icon="RiResetLeftLine" :disabled="loading" @click="$emit('reset-form')">
					重置表单
				</el-button>
				<el-button
					type="primary"
					:loading="loading"
					:icon="RiMusicAiFill"
					@click="$emit('submit-form')"
				>
					生成语音
				</el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";
import AudioProgress from "./AudioProgress.vue";
import { useWaveSurferPlayer, AudioHelper, type WaveSurferInstance } from "@/hooks/useWaveSurfer";

export interface FooterAudioProps {
	/** 音频路径 */
	audioPath: string;
	/** loading */
	loading: boolean;
}

const props = defineProps<FooterAudioProps>();
const _emit = defineEmits<{
	/** 重置表单 */
	"reset-form": [];
	/** 提交表单 */
	"submit-form": [];
}>();

// 图标定义
const RiDownloadLine = useIcon({ name: "ri-download-line", size: 22 });
const RiMusicAiFill = useIcon({ name: "ri-music-ai-fill", size: 16 });
const RiResetLeftLine = useIcon({ name: "ri-reset-left-line", size: 16 });

const audioRef = useTemplateRef<HTMLDivElement>("audioRef");
let playerInstance: WaveSurferInstance | undefined;
const { initPlayer, destroyPlayer, playerControls, playerData, state } = useWaveSurferPlayer();
const isPlaying = computed(() => state.value === "playing");
const isAudioPath = computed(() => {
	return typeof props.audioPath === "string" && props.audioPath.trim() !== "";
});

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
	// TODO: 需要实现下载功能
	console.log("下载音频");
}

/** 监听音频路径变化 */
watchEffect(() => {
	if (props.audioPath && playerInstance) {
		playerControls.loadAudio(props.audioPath);
	}
});

onMounted(() => {
	if (!audioRef.value) return;
	playerInstance = initPlayer({
		container: audioRef.value,
		url: props.audioPath
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
}
.footer-audio-left {
	flex-shrink: 0;
	width: 200px;
	.audio-icon {
		color: var(--el-color-primary);
		margin-bottom: 10px;
	}
	.audio-title {
		font-size: 16px;
		font-weight: bold;
		color: var(--el-text-color-primary);
	}
}
.footer-audio-right {
	flex-grow: 1;
	min-width: 0;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}
.footer-audio-right-content {
	flex-grow: 1;
	max-width: 900px;
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
</style>
