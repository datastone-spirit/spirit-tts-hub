<!--
 * @Author: mulingyuer
 * @Date: 2025-10-15 10:56:07
 * @LastEditTime: 2025-10-16 15:28:17
 * @LastEditors: mulingyuer
 * @Description: 录音组件
 * @FilePath: \frontend\src\components\Audio\AudioRecorder.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="audio-record">
		<div class="recorder-waveform-container">
			<div ref="waveformRef" class="recorder-waveform" />
			<div v-if="uploadState.loading" class="recorder-upload-overlay">
				<el-progress
					type="circle"
					:percentage="uploadState.progress"
					:width="60"
					:stroke-width="4"
					color="var(--el-color-primary)"
				/>
			</div>
		</div>

		<div class="recorder-controls">
			<div class="recorder-controls-left">
				<ElSpacePro :size="8">
					<el-button
						v-if="['idle', 'stopped'].includes(state)"
						class="start"
						:icon="RiRecordCircleFill"
						type="danger"
						size="default"
						@click="handleStartRecord"
					>
						{{ startText || "开始录制" }}
					</el-button>

					<el-button
						v-if="!['idle', 'stopped'].includes(state)"
						class="stop"
						:icon="RiStopCircleFill"
						type="danger"
						plain
						size="default"
						@click="handleStopRecord"
					>
						{{ stopText || "停止录制" }}
					</el-button>

					<el-button
						v-if="state === 'recording'"
						class="pause"
						:icon="RiPauseCircleFill"
						size="default"
						@click="handlePauseRecord"
					>
						{{ pauseText || "暂停" }}
					</el-button>

					<el-button
						v-if="state === 'paused'"
						class="resume"
						:icon="RiPlayCircleFill"
						size="default"
						@click="handleResumeRecord"
					>
						{{ resumeText || "继续" }}
					</el-button>
				</ElSpacePro>
			</div>
			<div class="recorder-controls-right">
				<ElSpacePro :size="8">
					<span class="recorder-duration">{{ formattedDuration }}</span>

					<el-select
						v-if="showDeviceSelector && recordOptions.length > 0"
						v-model="selectedDevice"
						class="device-selector"
						placeholder="选择录音设备"
						size="default"
					>
						<el-option
							v-for="option in recordOptions"
							:key="option.value"
							:label="option.label"
							:value="option.value"
						/>
					</el-select>
				</ElSpacePro>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useAudioUpload, type AudioUploadConfig } from "@/hooks/useAudioUpload";
import { useIcon } from "@/hooks/useIcon";
import {
	AudioHelper,
	useWaveSurferRecord,
	type WaveSurferInstance,
	type WaveSurferThemeKey
} from "@/hooks/useWaveSurfer";
import { useAppStore } from "@/stores";
import { generateUUID } from "@/utils/tools";

export interface RecordDevice {
	label: string;
	value: string;
}

export interface AudioRecorderProps {
	/** 是否显示设备选择器 */
	showDeviceSelector?: boolean;
	/** 开始录制按钮文字 */
	startText?: string;
	/** 停止录制按钮文字 */
	stopText?: string;
	/** 暂停按钮文字 */
	pauseText?: string;
	/** 继续按钮文字 */
	resumeText?: string;
	/** 上传配置 */
	uploadConfig?: AudioUploadConfig;
	/** 示波器高度 */
	waveSurferHeight?: number;
}

const props = withDefaults(defineProps<AudioRecorderProps>(), {
	showDeviceSelector: true,
	waveSurferHeight: 102
});
const filePath = defineModel("file-path", { type: String, required: true });

// icon
const RiRecordCircleFill = useIcon({ name: "ri-record-circle-fill", size: 16 });
const RiStopCircleFill = useIcon({ name: "ri-stop-circle-fill", size: 16 });
const RiPauseCircleFill = useIcon({ name: "ri-pause-circle-fill", size: 16 });
const RiPlayCircleFill = useIcon({ name: "ri-play-circle-fill", size: 16 });

const appStore = useAppStore();
const waveformRef = useTemplateRef<HTMLDivElement>("waveformRef");
// 录制相关
let recordInstance: WaveSurferInstance | undefined;
const selectedDevice = ref<string>("");
const recordOptions = ref<RecordDevice[]>([]);

const {
	state,
	recordData,
	recordEmitter,
	getRecordDevice,
	initRecord,
	destroyRecord,
	toggleTheme,
	startRecord,
	stopRecord,
	pauseRecord,
	resumeRecord,
	resetRecord,
	cancelRecord
} = useWaveSurferRecord();
const { uploadState, uploadFile } = useAudioUpload(props.uploadConfig);

/** 格式化录制时长 */
const formattedDuration = computed(() => {
	const duration = recordData.duration / 1000; // ms转s
	return AudioHelper.formatDuration(duration);
});

/** 获取录音设备 */
const getDevices = async () => {
	if (selectedDevice.value && recordOptions.value.length > 0) return;

	try {
		const devices = await getRecordDevice();
		if (devices.length > 0) {
			recordOptions.value = devices.map((device, index) => {
				if (index === 0) selectedDevice.value = device.deviceId;
				return {
					label: device.label || `设备 ${index + 1}`,
					value: device.deviceId
				};
			});
		} else {
			ElMessage.warning("没有可用的录音设备");
		}
	} catch (error) {
		console.error("获取录音设备失败:", error);
	}
};

/** 开始录制 */
const handleStartRecord = async () => {
	await getDevices();
	if (recordOptions.value.length === 0) return;

	startRecord({
		deviceId: selectedDevice.value
	});
};

/** 停止录制 */
const handleStopRecord = () => {
	stopRecord();
};

/** 暂停录制 */
const handlePauseRecord = () => {
	pauseRecord();
};

/** 继续录制 */
const handleResumeRecord = () => {
	resumeRecord();
};

/** 处理录制完成并上传 */
const handleRecordComplete = async (blob: Blob) => {
	try {
		// 创建文件对象
		const fileName = `${generateUUID()}`;
		const file = new File([blob], fileName, { type: blob.type });

		// 上传文件
		const result = await uploadFile({ file, showErrorMessage: false });

		if (typeof result.filePath !== "string") {
			ElMessage.error(result.message);
			return;
		}

		// 录制文件上传成功
		filePath.value = result.filePath;
		// 重置录制状态
		resetRecord();
	} catch (error) {
		console.error("录制文件上传失败:", error);
		ElMessage.error("录制文件上传失败");
	}
};

/** 监听录音结束事件 */
recordEmitter.on("record-end", (blob) => {
	handleRecordComplete(blob);
});

/** 监听主题变化 */
watchEffect(() => {
	if (!recordInstance) return;
	const theme: WaveSurferThemeKey = appStore.isDark ? "dark" : "light";
	toggleTheme(theme);
});

onMounted(async () => {
	await getDevices();

	if (!waveformRef.value) return;

	recordInstance = initRecord({
		container: waveformRef.value,
		theme: appStore.isDark ? "dark" : "light",
		options: {
			height: props.waveSurferHeight
		}
	});
});

onUnmounted(() => {
	destroyRecord();
});

/** 对外暴露的方法和状态 */
defineExpose({
	/** 取消录制 */
	cancelRecord: () => cancelRecord()
});
</script>

<style lang="scss" scoped>
.recorder-waveform-container {
	height: calc((v-bind(waveSurferHeight) * 1px) + ($zl-padding * 2) + 2px);
	border: 1px solid var(--el-border-color);
	border-radius: 6px;
	padding: $zl-padding;
	position: relative;
	overflow: hidden;
}
.recorder-waveform {
	height: 100%;
	position: relative;
	z-index: 1;
}
.recorder-upload-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 2;
	display: flex;
	background-color: var(--el-bg-color);
	:deep(.el-progress) {
		margin: auto;
	}
}
.recorder-controls {
	margin-top: 5px;
	display: flex;
	flex-wrap: wrap;
	font-size: 14px;
	line-height: normal;
}
.recorder-controls-left {
	flex-grow: 1;
	min-width: 0;
}
.recorder-controls-left :deep(.el-button) {
	border-radius: 8px;
	&.resume .el-icon {
		color: var(--el-color-primary);
	}
}
.recorder-controls-right {
	flex-shrink: 0;
}
.recorder-duration {
	color: var(--el-text-color-regular);
}
.device-selector {
	min-width: 200px;
}
</style>
