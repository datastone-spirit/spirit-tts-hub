<!--
 * @Author: mulingyuer
 * @Date: 2025-11-18 11:51:43
 * @LastEditTime: 2025-11-19 16:58:06
 * @LastEditors: mulingyuer
 * @Description: 音频播放弹窗
 * @FilePath: \frontend\src\components\Dialog\AudioPlayerDialog.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-dialog
		v-model="show"
		:title="name"
		width="650"
		align-center
		@opened="onOpened"
		@closed="onClosed"
	>
		<div class="audio-player-content">
			<audio ref="audioRef" class="audio-player" controls :src="audioPath"></audio>
			<el-button
				v-if="showDownloadBtn"
				class="audio-download-btn"
				type="primary"
				@click="onDownload"
			>
				下载
			</el-button>
		</div>
	</el-dialog>
</template>

<script setup lang="ts">
import { getEnv } from "@/utils/env";
import type { BaseModalProps } from "@/hooks/useModal";
import { downloadFile } from "@/utils/tools";

export interface AudioPlayerDialogProps {
	/** 音频地址 */
	url: string;
	/** 音频名称 */
	name: string;
	/** 是否自动播放 */
	autoPlay?: boolean;
	/** 是否显示下载按钮 */
	showDownloadBtn?: boolean;
}

const show = defineModel({ type: Boolean, required: true });
const props = withDefaults(defineProps<AudioPlayerDialogProps & BaseModalProps>(), {
	autoPlay: true,
	showDownloadBtn: true
});

const env = getEnv();
const audioRef = useTemplateRef("audioRef");
const audioPath = computed(() => {
	if (typeof props.url !== "string" || props.url.trim() === "") return "";
	return `${env.VITE_APP_API_BASE_URL}/audio/preview?filename=${encodeURIComponent(props.url)}`;
});

/** 弹窗打开 */
const onOpened = () => {
	if (props.autoPlay) {
		audioRef.value?.play();
	}
};

/** 弹窗关闭 */
const onClosed = () => {
	if (audioRef.value) {
		audioRef.value.pause();
		audioRef.value.currentTime = 0;
	}
};

/** 下载音频 */
const onDownload = () => {
	if (typeof props.url !== "string" || props.url.trim() === "") return;
	const url = `${env.VITE_APP_API_BASE_URL}/tts/download?filepath=${encodeURIComponent(props.url)}`;
	downloadFile(url);
};
</script>

<style lang="scss" scoped>
.audio-player-content {
	padding: $zl-padding 0;
	display: flex;
	align-items: center;
	gap: $zl-padding;
}
.audio-player {
	flex-grow: 1;
	min-width: 0;
	height: 40px;
}
.audio-download-btn {
	flex-shrink: 0;
}
</style>
