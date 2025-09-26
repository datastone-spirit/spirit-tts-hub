<!--
 * @Author: mulingyuer
 * @Date: 2025-09-25 11:28:14
 * @LastEditTime: 2025-09-26 15:44:26
 * @LastEditors: mulingyuer
 * @Description: 底部音乐组件
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
					<div class="audio-played-time">{{ formatDuration(currentDuration) }}</div>
					<div class="progress-container">
						<AudioProgress
							v-model="audioProgress"
							@change="controlFunctions.onAudioProgressChange"
						/>
						<div ref="audioRef" class="audio-ref"></div>
					</div>
					<div class="audio-total-time">{{ formatDuration(totalDuration) }}</div>
				</div>
				<div class="audio-control">
					<div class="audio-main-control">
						<el-button
							type="text"
							:icon="RiRewindFill"
							circle
							text
							@click="controlFunctions.onRewind"
						/>
						<el-button
							:type="audioState === 'playing' ? 'danger' : 'primary'"
							:icon="audioState === 'playing' ? RiPauseCircleFill : RiPlayCircleFill"
							circle
							text
							@click="controlFunctions.onPlayPause"
						/>
						<el-button
							type="text"
							:icon="RiSpeedFill"
							circle
							text
							@click="controlFunctions.onFastForward"
						/>
					</div>
					<div class="audio-other">
						<el-button
							type="primary"
							:icon="RiDownloadLine"
							circle
							text
							@click="controlFunctions.onDownload"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import WaveSurfer from "wavesurfer.js";
import templateAudio from "@/assets/audio/j816336nczz00zb3kqzxxnuve3ub5w2.ogg";
import { useIcon } from "@/hooks/useIcon";
import AudioProgress from "./AudioProgress.vue";

type AudioState =
	| "idle" // 空闲
	| "playing" // 播放中
	| "paused" // 暂停中
	| "ended"; // 结束

// icon
const RiRewindFill = useIcon({ name: "ri-rewind-fill", size: 20 });
const RiPlayCircleFill = useIcon({ name: "ri-play-circle-fill", size: 32 });
const RiPauseCircleFill = useIcon({ name: "ri-pause-circle-fill", size: 32 });
const RiSpeedFill = useIcon({ name: "ri-speed-fill", size: 20 });
const RiDownloadLine = useIcon({ name: "ri-download-line", size: 22 });

const audioRef = useTemplateRef("audioRef");
let audio: WaveSurfer | null = null;
const audioState = ref<AudioState>("idle");
const controlFunctions = {
	onRewind: () => {
		audio?.skip(-5);
	},
	onPlayPause: () => {
		if (!audio) return;
		audio.playPause();
	},
	onFastForward: () => {
		audio?.skip(5);
	},
	onAudioProgressChange: (value: any) => {
		if (!audio) return;
		audio.seekTo(Math.min((value / 100) * 1, 1));
	},
	onDownload: () => {}
};
let resetTimer: null | number;
const currentDuration = ref(0);
const totalDuration = ref(0);
function formatDuration(seconds: number) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}
const audioProgress = ref(0); // 0-100

onMounted(() => {
	if (!audioRef.value) return;

	audio = new WaveSurfer({
		container: audioRef.value,
		url: templateAudio,
		height: "auto",
		width: "auto"
	});
	// 事件监听
	audio.on("play", () => {
		audioState.value = "playing";
	});
	audio.on("finish", () => {
		audioState.value = "ended";
		if (resetTimer) clearTimeout(resetTimer);
		resetTimer = setTimeout(() => {
			audio?.seekTo(0);
			audioState.value = "idle";
		}, 500);
	});
	audio.on("pause", () => {
		audioState.value = "paused";
	});
	audio.on("ready", () => {
		totalDuration.value = audio!.getDuration();
	});
	audio.on("timeupdate", () => {
		currentDuration.value = audio!.getCurrentTime();
		audioProgress.value = Math.min(
			100,
			Math.floor((currentDuration.value / totalDuration.value) * 100)
		);
	});
});

onUnmounted(() => {
	if (!audio) return;

	audio.destroy();
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
