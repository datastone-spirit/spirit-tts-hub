<!--
 * @Author: mulingyuer
 * @Date: 2025-09-25 11:28:14
 * @LastEditTime: 2025-09-26 17:01:33
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
					<div class="audio-played-time">{{ formatDuration(audioData.currentDuration) }}</div>
					<div class="progress-container">
						<AudioProgress v-model="audioData.progress" @change="audioControls.progressChange" />
						<div ref="audioRef" class="audio-ref"></div>
					</div>
					<div class="audio-total-time">{{ formatDuration(audioData.totalDuration) }}</div>
				</div>

				<div class="audio-control">
					<div class="audio-main-control">
						<el-button type="text" :icon="RiRewindFill" circle text @click="audioControls.rewind" />
						<el-button
							:type="isPlaying ? 'danger' : 'primary'"
							:icon="isPlaying ? RiPauseCircleFill : RiPlayCircleFill"
							circle
							text
							@click="audioControls.playPause"
						/>
						<el-button
							type="text"
							:icon="RiSpeedFill"
							circle
							text
							@click="audioControls.fastForward"
						/>
					</div>
					<div class="audio-other">
						<el-button
							type="primary"
							:icon="RiDownloadLine"
							circle
							text
							@click="audioControls.download"
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

// 常量定义
const SKIP_SECONDS = 5; // 快进/快退秒数
const RESET_DELAY = 500; // 播放结束后重置延迟时间（毫秒）

// 图标定义
const RiRewindFill = useIcon({ name: "ri-rewind-fill", size: 20 });
const RiPlayCircleFill = useIcon({ name: "ri-play-circle-fill", size: 32 });
const RiPauseCircleFill = useIcon({ name: "ri-pause-circle-fill", size: 32 });
const RiSpeedFill = useIcon({ name: "ri-speed-fill", size: 20 });
const RiDownloadLine = useIcon({ name: "ri-download-line", size: 22 });

const audioRef = useTemplateRef("audioRef");
// 音频播放状态数据
const audioData = reactive({
	state: "idle" as AudioState,
	currentDuration: 0,
	totalDuration: 0,
	progress: 0 // 0-100
});
const isPlaying = computed(() => audioData.state === "playing");
let audio: WaveSurfer | null = null;
let resetTimer: number | null = null;

/** 初始化音频播放器 */
const initializeAudio = () => {
	if (!audioRef.value) return;

	audio = new WaveSurfer({
		container: audioRef.value,
		url: templateAudio,
		height: "auto",
		width: "auto"
	});

	setupAudioEventListeners();
};

/** 设置音频事件监听器 */
const setupAudioEventListeners = () => {
	if (!audio) return;

	audio.on("play", () => {
		audioData.state = "playing";
	});

	audio.on("pause", () => {
		audioData.state = "paused";
	});

	audio.on("finish", handleAudioFinish);

	audio.on("ready", () => {
		audioData.totalDuration = audio!.getDuration();
	});

	audio.on("timeupdate", () => {
		updateProgress();
	});
};

/** 处理音频播放结束 */
const handleAudioFinish = () => {
	audioData.state = "ended";
	if (resetTimer) clearTimeout(resetTimer);

	resetTimer = setTimeout(() => {
		audio?.seekTo(0);
		audioData.state = "idle";
	}, RESET_DELAY);
};

/** 更新播放进度 */
const updateProgress = () => {
	if (!audio) return;

	audioData.currentDuration = audio.getCurrentTime();
	audioData.progress = Math.min(
		100,
		Math.floor((audioData.currentDuration / audioData.totalDuration) * 100)
	);
};

// 控制函数聚合
const audioControls = {
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

	/** 进度条变化处理 */
	progressChange: (value: number) => {
		if (!audio) return;
		const seekPosition = Math.min(value / 100, 1);
		audio.seekTo(seekPosition);
	},

	/** 下载音频 */
	download: () => {
		// TODO: 实现下载功能
		console.log("下载音频");
	}
};

// 格式化时长显示
const formatDuration = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

onMounted(() => {
	initializeAudio();
});

onUnmounted(() => {
	if (resetTimer) {
		clearTimeout(resetTimer);
	}

	if (audio) {
		audio.destroy();
		audio = null;
	}
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
