<!--
 * @Author: mulingyuer
 * @Date: 2025-09-25 11:28:14
 * @LastEditTime: 2025-10-13 11:11:57
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
			<div class="footer-audio-right-content">
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
	</div>
</template>

<script setup lang="ts">
import templateAudio from "@/assets/audio/j816336nczz00zb3kqzxxnuve3ub5w2.ogg";
import { useIcon } from "@/hooks/useIcon";
import AudioProgress from "./AudioProgress.vue";
import { useWaveSurferPlayer, AudioHelper } from "@/hooks/useWaveSurfer";

// 图标定义
const RiDownloadLine = useIcon({ name: "ri-download-line", size: 22 });

const audioRef = useTemplateRef<HTMLDivElement>("audioRef");
const { initPlayer, destroyPlayer, playerControls, playerData, state } = useWaveSurferPlayer();
const isPlaying = computed(() => state.value === "playing");

// 音频控制
function onRewind() {
	playerControls.rewind();
}
function onPlayPause() {
	playerControls.playPause();
}
function onFastForward() {
	playerControls.fastForward();
}
/** 下载音频 */
function onDownloadAudio() {
	// TODO: 实现下载功能
	console.log("下载音频");
}

onMounted(() => {
	if (!audioRef.value) return;
	initPlayer({
		container: audioRef.value,
		url: templateAudio
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
