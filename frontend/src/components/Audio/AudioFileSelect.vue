<!--
 * @Author: mulingyuer
 * @Date: 2025-10-29 11:35:37
 * @LastEditTime: 2025-10-29 14:48:36
 * @LastEditors: mulingyuer
 * @Description: 音频文件选择组件
 * @FilePath: \frontend\src\components\Audio\AudioFileSelect.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="audio-file-select">
		<el-space fill style="width: 100%">
			<FilePicker
				v-model="path"
				:mime-type="mimeType"
				confirm-on-enter
				@confirm="onFilePickerConfirm"
			/>
			<el-alert class="audio-file-select-info" type="info" :closable="false">
				<ol>
					<li>点击右侧文件图标可选择音频文件。</li>
					<li>点击输入框可自行输入文件路径，回车确认。</li>
				</ol>
			</el-alert>
		</el-space>
	</div>
</template>

<script setup lang="ts">
import type { FileResult } from "@/api/common";

export interface AudioFileSelectProps {
	/** 音频文件类型 */
	mimeType?: string;
	/** 容器高度 */
	height?: number;
}

export interface AudioFileSelectEmits {
	/** 文件选择确认 */
	"file-picker-confirm": [data: FileResult];
}

const path = defineModel({ type: String, required: true });
const _props = withDefaults(defineProps<AudioFileSelectProps>(), {
	mimeType: "audio/",
	height: 143
});
const emit = defineEmits<AudioFileSelectEmits>();

/** 文件选择确认 */
const onFilePickerConfirm = (file: FileResult) => {
	emit("file-picker-confirm", file);
};
</script>

<style lang="scss" scoped>
.audio-file-select {
	width: 100%;
	height: calc(v-bind(height) * 1px);
}
.audio-file-select-info {
	padding: 8px;
	:deep(ol) {
		padding-inline-start: 24px;
		font-size: 14px;
		line-height: 24px;
	}
}
</style>
