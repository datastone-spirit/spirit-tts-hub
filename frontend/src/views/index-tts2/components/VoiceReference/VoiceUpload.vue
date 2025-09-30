<!--
 * @Author: mulingyuer
 * @Date: 2025-09-28 11:45:20
 * @LastEditTime: 2025-09-30 14:20:01
 * @LastEditors: mulingyuer
 * @Description: 上传音频文件
 * @FilePath: \frontend\src\views\index-tts2\components\VoiceReference\VoiceUpload.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="voice-upload">
		<el-upload
			class="voice-upload-input"
			ref="uploadRef"
			drag
			accept="audio/*"
			:show-file-list="false"
			:limit="1"
			:on-exceed="handleExceed"
			:http-request="onUploadFile"
			:on-progress="handleProgress"
			:on-success="handleSuccess"
			:on-error="handleError"
			:disabled="uploadData.loading"
		>
			<div v-if="!uploadData.loading" class="voice-upload-text">
				<Icon class="el-icon--upload" name="ri-upload-2-line" />
				<div class="el-upload__text">
					<div>将音频文件拖拽到此处或</div>
					<div style="opacity: 0.5">- 或 -</div>
					<div><em>点击上传</em></div>
				</div>
			</div>
			<div v-else class="voice-upload-progress-container">
				<el-progress
					class="upload-content-progress"
					type="circle"
					:percentage="uploadData.percentage"
					:width="80"
					:stroke-width="5"
					color="var(--el-color-primary)"
				/>
			</div>
		</el-upload>
	</div>
</template>

<script setup lang="ts">
// import { uploadFiles } from "@/api/common";
// import type { AxiosProgressEvent } from "axios";

import {
	genFileId,
	type UploadInstance,
	type UploadProgressEvent,
	type UploadRawFile,
	type UploadRequestOptions
} from "element-plus";

import type { UploadData } from "./types";
import { sleep } from "@/utils/tools";

// 上传文件
const uploadData = defineModel({ type: Object as PropType<UploadData>, required: true });
const uploadRef = useTemplateRef<UploadInstance>("uploadRef");

/** 与limit=1一起使用，自动替换上一个文件 */
function handleExceed(files: File[]) {
	uploadRef.value!.clearFiles();
	const file = files[0] as UploadRawFile;
	file.uid = genFileId();
	uploadRef.value!.handleStart(file);
}
// 上传文件
async function onUploadFile(options: UploadRequestOptions) {
	console.log("🚀 ~ onUploadFile ~ options:", options);
	uploadData.value.loading = true;
	uploadData.value.isEnd = false;
	setTimeout(() => {
		uploadData.value.percentage = 50;
	}, 1000);
	await sleep(2000);
	uploadData.value.percentage = 100;
	uploadData.value.loading = false;
	sleep(1000).then(() => {
		uploadData.value.percentage = 0;
	});
	return { message: "完成" };

	// const { file, onProgress, onSuccess, onError } = options;
	// try {
	// 	const formData = new FormData();
	// 	formData.append("files", file, file.name);

	// 	// 上传
	// 	const response = await uploadFiles({
	// 		files: formData,
	// 		params: {
	// 			upload_path: "/root/test-tts-upload",
	// 			upload_id: file.uid
	// 		},
	// 		onUploadProgress: (progressEvent: AxiosProgressEvent) => {
	// 			console.log("🚀 ~ onUploadFile ~ progressEvent:", progressEvent);
	// 			if (!progressEvent) return;
	// 			onProgress(progressEvent.event);
	// 		}
	// 	});

	// 	// 上传成功
	// 	onSuccess(response);
	// } catch (error: any) {
	// 	onError(error);
	// }
}
function handleProgress(evt: UploadProgressEvent) {
	console.log("🚀 ~ handleProgress ~ evt:", evt);
}
function handleSuccess(response: any) {
	console.log("🚀 ~ handleSuccess ~ response:", response);
	uploadData.value.path = "/admin/src/assets/audio/j816336nczz00zb3kqzxxnuve3ub5w2.ogg";
	uploadData.value.isEnd = true;
	uploadRef.value?.clearFiles();
}
function handleError(error: any) {
	console.log("🚀 ~ handleError ~ error:", error);
}
</script>

<style lang="scss" scoped>
.voice-upload-input {
	:deep(.el-upload-dragger) {
		padding: $zl-padding;
		height: var(--voice-reference-content-height);
	}
	.el-icon--upload {
		font-size: 36px;
		margin-bottom: 5px;
	}
}
.voice-upload-progress-container {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	background-color: var(--el-bg-color);
}
.upload-content-progress {
	margin: auto;
}
</style>
