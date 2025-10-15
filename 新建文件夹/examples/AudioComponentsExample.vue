<!--
 * @Author: mulingyuer
 * @Date: 2025-10-14 16:00:00
 * @LastEditTime: 2025-10-14 16:01:53
 * @LastEditors: mulingyuer
 * @Description: 音频组件使用示例
 * @FilePath: \frontend\src\examples\AudioComponentsExample.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="audio-examples">
		<h2>音频组件使用示例</h2>

		<!-- 示例1: 完整的语音参考组件 -->
		<el-card class="example-card">
			<template #header>
				<h3>示例1: 完整的语音参考组件</h3>
			</template>

			<VoiceReference
				:player-height="'180px'"
				:show-history="true"
				:upload-config="uploadConfig"
				@audio-selected="handleAudioSelected"
				@audio-change="handleAudioChange"
			/>
		</el-card>

		<!-- 示例2: 独立的音频上传器 -->
		<el-card class="example-card">
			<template #header>
				<h3>示例2: 独立的音频上传器</h3>
			</template>

			<AudioUploader
				drag-text="拖拽音频文件到这里"
				click-text="或点击选择文件"
				:progress-size="60"
				:config="uploadConfig"
				@upload-success="handleUploadSuccess"
				@upload-error="handleUploadError"
			/>
		</el-card>

		<!-- 示例3: 独立的音频播放器 -->
		<el-card class="example-card">
			<template #header>
				<h3>示例3: 独立的音频播放器</h3>
			</template>

			<div v-if="!currentAudioPath" class="no-audio">请先上传音频文件</div>

			<AudioPlayer
				v-else
				:audio-path="currentAudioPath"
				:play-state="playState"
				:region-enabled="regionEnabled"
				:loading="playerLoading"
				:show-controls="true"
				:show-duration="true"
				:enable-region="true"
				height="150px"
				@play-state-change="playState = $event as any"
				@region-change="regionEnabled = $event"
				@cut-complete="handleCutComplete"
				@clear="handleClearPlayer"
			/>
		</el-card>

		<!-- 示例4: 独立的音频录制器 -->
		<el-card class="example-card">
			<template #header>
				<h3>示例4: 独立的音频录制器</h3>
			</template>

			<AudioRecorder
				:show-device-selector="true"
				start-text="开始录音"
				stop-text="结束录音"
				:upload-config="uploadConfig"
				height="150px"
				@record-start="handleRecordStart"
				@record-end="handleRecordEnd"
				@upload-complete="handleRecordUploadComplete"
				@state-change="handleRecordStateChange"
			/>
		</el-card>

		<!-- 示例5: 简化的音频管理器使用 -->
		<el-card class="example-card">
			<template #header>
				<h3>示例5: 使用音频管理器</h3>
			</template>

			<div class="audio-manager-demo">
				<div class="manager-info">
					<p><strong>当前音频:</strong> {{ audioManager.currentPath.value || "无" }}</p>
					<p><strong>播放状态:</strong> {{ audioManager.state.playState }}</p>
					<p>
						<strong>区域选择:</strong> {{ audioManager.state.regionEnabled ? "已启用" : "未启用" }}
					</p>
					<p><strong>历史记录:</strong> {{ audioManager.state.history.length }} 个</p>
				</div>

				<div class="manager-controls">
					<el-button
						@click="audioManager.setCurrentAudio({ path: '/demo/audio.mp3', source: 'upload' })"
					>
						设置演示音频
					</el-button>
					<el-button @click="audioManager.clearCurrentAudio()"> 清除音频 </el-button>
					<el-button @click="audioManager.clearHistory()"> 清除历史 </el-button>
				</div>
			</div>
		</el-card>

		<!-- 示例6: 自定义上传配置 -->
		<el-card class="example-card">
			<template #header>
				<h3>示例6: 自定义上传配置</h3>
			</template>

			<AudioUploader :config="customUploadConfig" @upload-success="handleCustomUploadSuccess" />
		</el-card>
	</div>
</template>

<script setup lang="ts">
import { AudioUploader, AudioPlayer, AudioRecorder } from "@/components/Audio";
import { VoiceReference } from "@/components/VoiceReference";
import { useAudioManager } from "@/hooks/useAudioManager";
import type { AudioUploadConfig } from "@/hooks/useAudioUpload";

// 音频管理器
const audioManager = useAudioManager();

// 播放器状态
const currentAudioPath = ref("");
const playState = ref<"idle" | "playing" | "paused" | "ended">("idle");
const regionEnabled = ref(false);
const playerLoading = ref(false);

// 基础上传配置
const uploadConfig: AudioUploadConfig = {
	uploadPath: "/root/audio-upload",
	maxSize: 50, // 50MB
	accept: ["audio/*"]
};

// 自定义上传配置
const customUploadConfig: AudioUploadConfig = {
	uploadPath: "/root/custom-audio",
	maxSize: 100, // 100MB
	accept: ["audio/wav", "audio/mp3", "audio/ogg"],
	customUpload: async (file: File, onProgress?: (progress: number) => void) => {
		// 自定义上传逻辑
		return new Promise((resolve) => {
			let progress = 0;
			const timer = setInterval(() => {
				progress += 10;
				onProgress?.(progress);

				if (progress >= 100) {
					clearInterval(timer);
					resolve(`/custom/upload/${file.name}`);
				}
			}, 100);
		});
	}
};

// 事件处理
const handleAudioSelected = (path: string) => {
	console.log("音频选择:", path);
	currentAudioPath.value = path;
};

const handleAudioChange = (audioInfo: any) => {
	console.log("音频变化:", audioInfo);
};

const handleUploadSuccess = (path: string) => {
	console.log("上传成功:", path);
	currentAudioPath.value = path;
	ElMessage.success("上传成功");
};

const handleUploadError = (error: string) => {
	console.error("上传失败:", error);
	ElMessage.error(`上传失败: ${error}`);
};

const handleCutComplete = (audioUrl: string) => {
	console.log("裁剪完成:", audioUrl);
	currentAudioPath.value = audioUrl;
	ElMessage.success("音频裁剪完成");
};

const handleClearPlayer = () => {
	currentAudioPath.value = "";
	playState.value = "idle";
	regionEnabled.value = false;
};

const handleRecordStart = () => {
	console.log("开始录制");
};

const handleRecordEnd = (blob: Blob) => {
	console.log("录制结束:", blob);
};

const handleRecordUploadComplete = (path: string) => {
	console.log("录制上传完成:", path);
	currentAudioPath.value = path;
	ElMessage.success("录制完成并上传成功");
};

const handleRecordStateChange = (state: string) => {
	console.log("录制状态变化:", state);
};

const handleCustomUploadSuccess = (path: string) => {
	console.log("自定义上传成功:", path);
	ElMessage.success(`自定义上传成功: ${path}`);
};
</script>

<style lang="scss" scoped>
.audio-examples {
	padding: 20px;
	max-width: 1200px;
	margin: 0 auto;
}

.example-card {
	margin-bottom: 24px;

	:deep(.el-card__header) {
		background-color: var(--el-fill-color-lighter);

		h3 {
			margin: 0;
			color: var(--el-text-color-primary);
		}
	}
}

.no-audio {
	text-align: center;
	padding: 40px;
	color: var(--el-text-color-placeholder);
	background-color: var(--el-fill-color-lighter);
	border-radius: 6px;
}

.audio-manager-demo {
	.manager-info {
		background-color: var(--el-fill-color-lighter);
		padding: 16px;
		border-radius: 6px;
		margin-bottom: 16px;

		p {
			margin: 8px 0;
			font-size: 14px;
		}
	}

	.manager-controls {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
}
</style>
