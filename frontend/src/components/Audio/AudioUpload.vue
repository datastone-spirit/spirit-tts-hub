<!--
 * @Author: mulingyuer
 * @Date: 2025-10-15 09:10:30
 * @LastEditTime: 2025-10-16 15:21:06
 * @LastEditors: mulingyuer
 * @Description: 音频上传
 * @FilePath: \frontend\src\components\Audio\AudioUpload.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="audio-upload">
		<el-upload
			ref="uploadRef"
			class="audio-uploader-input"
			drag
			accept="audio/*"
			:show-file-list="false"
			:limit="1"
			:on-exceed="handleExceed"
			:http-request="handleUpload"
			:on-success="handleSuccess"
			:on-error="handleError"
			:disabled="uploadState.loading"
		>
			<div v-if="!uploadState.loading" class="audio-uploader-content">
				<Icon class="el-icon--upload" name="ri-upload-2-line" />
				<div class="el-upload__text">
					<div>{{ dragText || "将音频文件拖拽到此处或" }}</div>
					<div class="upload-divider">- 或 -</div>
					<div>
						<em>{{ clickText || "点击上传" }}</em>
					</div>
				</div>
			</div>
			<div v-else class="audio-uploader-progress">
				<el-progress
					type="circle"
					:percentage="uploadState.progress"
					:width="progressSize"
					:stroke-width="5"
					color="var(--el-color-primary)"
				/>
			</div>
		</el-upload>
	</div>
</template>

<script setup lang="ts">
import { useAudioUpload, type AudioUploadConfig } from "@/hooks/useAudioUpload";
import { genFileId, type UploadInstance, type UploadRawFile } from "element-plus";

export interface AudioUploaderProps {
	/** 拖拽提示文字 */
	dragText?: string;
	/** 点击提示文字 */
	clickText?: string;
	/** 进度条大小 */
	progressSize?: number;
	/** 上传配置 */
	config?: AudioUploadConfig;
	/** 高度 */
	height?: number;
}

const filePath = defineModel("file-path", { type: String, required: true });
const props = withDefaults(defineProps<AudioUploaderProps>(), {
	progressSize: 80,
	height: 165
});

const uploadRef = useTemplateRef<UploadInstance>("uploadRef");
const { uploadState, handleUpload: _handleUpload } = useAudioUpload(props.config);

/** 处理文件超出限制 */
const handleExceed = (files: File[]) => {
	uploadRef.value!.clearFiles();
	const file = files[0] as UploadRawFile;
	file.uid = genFileId();
	uploadRef.value!.handleStart(file);
};

/** 自定义上传 */
const handleUpload = _handleUpload;

/** 上传成功 */
const handleSuccess = (response: string) => {
	if (!response) return;

	filePath.value = response;
	uploadRef.value?.clearFiles();
};

/** 上传失败 */
const handleError = (_error: any) => {
	uploadRef.value?.clearFiles();
};

/** 对外暴露上传状态 */
defineExpose({
	uploadState,
	clearFiles: () => uploadRef.value?.clearFiles()
});
</script>

<style lang="scss" scoped>
.audio-upload {
	width: 100%;
}
.audio-uploader-input {
	.el-icon--upload {
		font-size: 36px;
		margin-bottom: 5px;
	}
}
.audio-uploader-input :deep(.el-upload-dragger) {
	padding: $zl-padding;
	height: calc(v-bind(height) * 1px);
	display: flex;
	.audio-uploader-content {
		margin: auto;
		line-height: normal;
	}
}
.upload-divider {
	opacity: 0.5;
}
.audio-uploader-progress {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	background-color: var(--el-bg-color);
	:deep(.el-progress) {
		margin: auto;
	}
}
</style>
