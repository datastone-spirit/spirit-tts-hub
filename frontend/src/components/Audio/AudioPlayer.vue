<!--
 * @Author: mulingyuer
 * @Date: 2025-10-14 16:26:13
 * @LastEditTime: 2025-11-06 16:25:06
 * @LastEditors: mulingyuer
 * @Description: 音频播放组件
 * @FilePath: \frontend\src\components\Audio\AudioPlayer.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="audio-player" :class="{ 'has-controls': showControls }">
		<div class="waveform-container" v-loading="loading">
			<el-button
				v-if="showClearButton"
				class="audio-player-clear"
				:icon="RiCloseFill"
				size="small"
				@click="onAudioPlayerClear"
			></el-button>
			<div class="audio-player-waveform" ref="waveformRef" />
		</div>

		<div v-if="showDuration" class="audio-player-duration">
			<div class="current-time">
				{{ AudioHelper.formatDuration(playerData.currentDuration) }}
			</div>
			<div class="total-time">
				<span v-if="showRegion" class="region-duration">
					{{ AudioHelper.formatDuration(playerData.regionEnd - playerData.regionStart) }}
				</span>
				<span class="total-duration">
					{{ AudioHelper.formatDuration(playerData.totalDuration) }}
				</span>
			</div>
		</div>

		<div v-if="showControls" class="audio-player-controls">
			<div class="player-controls">
				<ElSpacePro v-show="!uploadState.loading" :size="20" f>
					<RewindButton @click="onRewindPlayer" />
					<PlayPauseButton :isPlaying="isPlaying" @click="onPlayPausePlayer" />
					<SkipButton @click="onSkipPlayer" />
				</ElSpacePro>
			</div>
			<div v-if="enableRegion" class="regin-controls">
				<div v-if="uploadState.loading" class="regin-upload-progress-wrapper">
					<div class="regin-upload-text">处理中</div>
					<div class="regin-upload-progress">
						<el-progress :percentage="uploadState.progress" />
					</div>
				</div>
				<ElSpacePro v-else :size="8">
					<el-button v-show="!isRegion" :icon="RiScissorsLine" size="default" @click="onAddRegion">
						裁剪
					</el-button>
					<el-button
						v-show="!isRegion"
						:icon="RiArrowGoBackLine"
						size="default"
						@click="onResetRegion"
					>
						还原
					</el-button>
					<el-button v-show="isRegion" :icon="RiCheckLine" size="default" @click="onConfirmRegion">
						确认
					</el-button>
					<el-button
						v-show="isRegion"
						class="cancel"
						size="default"
						:icon="RiCloseFill"
						@click="onCancelRegion"
					>
						取消
					</el-button>
				</ElSpacePro>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useFileUpload, type FileUploadConfig } from "@/hooks/useFileUpload";
import { useIcon } from "@/hooks/useIcon";
import {
	AudioHelper,
	useWaveSurferPlayer,
	type WaveSurferInstance,
	type WaveSurferThemeKey
} from "@/hooks/useWaveSurfer";
import { useAppStore } from "@/stores";
import { generateUUID } from "@/utils/tools";
import type { UploadRawFile, UploadUserFile } from "element-plus";
import mime from "mime";

export interface AudioPlayerProps {
	/** 音频文件路径 */
	audioPath: string;
	/** 是否启用区域选择 */
	regionEnabled?: boolean;
	/** 是否显示控制按钮 */
	showControls?: boolean;
	/** 是否显示时长信息 */
	showDuration?: boolean;
	/** 是否显示清除按钮 */
	showClearButton?: boolean;
	/** 是否启用区域功能 */
	enableRegion?: boolean;
	/** 示波器高度 */
	waveSurferHeight?: number;
	/** 上传配置 */
	config?: FileUploadConfig;
}

export interface AudioPlayerEmits {
	/** 开始裁剪 */
	"region-start": [];
	/** 裁剪结束 */
	"region-complete": [blob: Blob];
	/** 裁剪还原 */
	"region-reset": [];
	/** 裁剪文件上传完成 */
	"region-uploaded": [file: UploadUserFile];
	/** 裁剪文件上传失败 */
	"region-upload-error": [error: any];
	/** 清除 */
	clear: [];
}

const props = withDefaults(defineProps<AudioPlayerProps>(), {
	regionEnabled: false,
	showControls: true,
	showDuration: true,
	showClearButton: true,
	enableRegion: true,
	waveSurferHeight: 74
});
const emit = defineEmits<AudioPlayerEmits>();

// icon
const RiCloseFill = useIcon({ name: "ri-close-fill", size: 14 });
const RiScissorsLine = useIcon({ name: "ri-scissors-line", size: 14 });
const RiArrowGoBackLine = useIcon({ name: "ri-arrow-go-back-line", size: 14 });
const RiCheckLine = useIcon({ name: "ri-check-line", size: 14 });

const appStore = useAppStore();
const waveformRef = useTemplateRef("waveformRef");
let playerInstance: WaveSurferInstance | undefined;
const {
	loading,
	state,
	isRegion,
	playerControls,
	regionControls,
	initPlayer,
	destroyPlayer,
	playerData,
	toggleTheme,
	playerEmitter,
	getPreviewPath
} = useWaveSurferPlayer({ loop: false });
const { uploadState, uploadFile } = useFileUpload({
	accept: ["audio/"],
	...props.config
});

const showRegion = computed(() => {
	return props.enableRegion && isRegion.value;
});
const isPlaying = computed(() => state.value === "playing");

/** 清除 */
function onAudioPlayerClear() {
	playerControls.stop();
	regionControls.clear();

	// 事件
	emit("clear");
}

/** 快退 */
function onRewindPlayer() {
	playerControls.rewind();
}
/** 播放或暂停 */
function onPlayPausePlayer() {
	playerControls.playPause();
}
/** 快进 */
function onSkipPlayer() {
	playerControls.skip();
}

/** 添加选区 */
function onAddRegion() {
	regionControls.addRegion();
}
/** 裁剪还原 */
function onResetRegion() {
	// 停止播放
	playerControls.stop();
	// 清空选区
	regionControls.clear();
	// 还原原文件
	emit("region-reset");
}
/** 确认裁剪 */
async function onConfirmRegion() {
	try {
		// 事件
		emit("region-start");

		// 裁剪
		const audioBlob = regionControls.cut();
		if (!audioBlob) {
			ElMessage.warning("裁剪失败，请重新裁剪。");
			return;
		}

		// 创建文件对象
		const uuid = generateUUID();
		const fileName = `${uuid}.${mime.getExtension(audioBlob.type)}`;
		const file = new File([audioBlob], fileName, { type: audioBlob.type });
		// @ts-expect-error fuck ts type
		file.uid = uuid;
		// @ts-expect-error fuck ts type
		file.isDirectory = false;

		// 上传文件
		const result = await uploadFile({ file: file as UploadRawFile, showErrorMessage: false });

		if (!result.success) {
			ElMessage.error(result.message);
			return;
		}

		// 上传完成
		emit("region-uploaded", result.data);
	} catch (error) {
		emit("region-upload-error", error);

		ElMessage.error("裁剪文件上传失败");
		console.error("裁剪文件上传失败:", error);
	}
}
/** 取消裁剪 */
function onCancelRegion() {
	regionControls.deleteRegion();
}

/** 监听主题变化 */
watchEffect(() => {
	if (!playerInstance) return;
	const theme: WaveSurferThemeKey = appStore.isDark ? "dark" : "light";
	toggleTheme(theme);
});

/** 监听音频路径变化 */
watchEffect(() => {
	if (props.audioPath && playerInstance) {
		playerControls.loadAudio(getPreviewPath(props.audioPath));
	}
});

/** 监听裁剪完成事件 */
playerEmitter.on("region-complete", (blob: Blob) => {
	emit("region-complete", blob);
});

onMounted(() => {
	if (!waveformRef.value) return;
	let url = "";
	if (typeof props.audioPath === "string" && props.audioPath.trim() !== "") {
		url = getPreviewPath(props.audioPath);
	}

	playerInstance = initPlayer({
		container: waveformRef.value,
		url,
		theme: appStore.isDark ? "dark" : "light",
		options: {
			height: props.waveSurferHeight
		}
	});
});

onUnmounted(() => {
	destroyPlayer();
});

defineExpose({
	/** 重置 */
	reset() {
		regionControls.clear();
		playerControls.stop();
	}
});
</script>

<style lang="scss" scoped>
@use "sass:math";

// .audio-player {
// }
.waveform-container {
	border: 1px solid var(--el-border-color);
	border-radius: 6px;
	padding: $zl-padding;
	height: calc((v-bind(waveSurferHeight) * 1px) + ($zl-padding * 2) + 2px);
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
		background-color: var(--zl-waveform-region-default-selection);
	}
}
.audio-player-duration {
	margin-top: 5px;
	height: 20px;
	line-height: 20px;
	padding: 0 math.div($zl-padding, 2);
	display: flex;
	justify-content: space-between;
	font-size: 14px;
	color: var(--el-text-color-regular);
}
.region-duration {
	color: var(--el-color-primary);
	margin-right: $zl-padding;
}
.audio-player-controls {
	margin-top: 8px;
	height: 32px;
	padding: 0 math.div($zl-padding, 2);
	display: flex;
	align-items: center;
}
.player-controls {
	flex-grow: 1;
	min-width: 0;
}
.player-controls :deep(.el-space) {
	width: 100%;
	justify-content: center;
}
.regin-controls {
	flex-shrink: 0;
	display: flex;
	align-items: center;
}
.regin-upload-progress-wrapper {
	display: flex;
	align-items: center;
	gap: $zl-padding;
}
.regin-upload-text {
	font-size: 14px;
	color: var(--el-text-color-regular);
}
.regin-upload-progress {
	min-width: 120px;
	:deep(.el-progress__text) {
		min-width: 0;
	}
}
.regin-controls :deep(.el-button) {
	border-radius: 8px;
	box-shadow: 0px 0px 4px var(--zl-box-shadow);
	&:not(.el-button--primary) .el-icon {
		color: var(--el-color-primary);
	}
	&.cancel .el-icon {
		color: var(--el-color-danger);
	}
}
</style>
