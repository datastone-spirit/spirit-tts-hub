<!--
 * @Author: mulingyuer
 * @Date: 2025-10-11 17:32:45
 * @LastEditTime: 2025-10-14 15:12:57
 * @LastEditors: mulingyuer
 * @Description: 录音组件
 * @FilePath: \frontend\src\views\index-tts2\components\VoiceReference\VoiceRecord.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="voice-record">
		<div class="waveform-container">
			<div ref="waveformRef" class="record-waveform"></div>
			<div v-show="recordUploadData.loading" class="record-upload">
				<el-progress
					class="record-upload-progress"
					type="circle"
					:percentage="recordUploadData.percentage"
					:width="60"
					:stroke-width="4"
					color="var(--el-color-primary)"
				/>
			</div>
		</div>
		<div class="voice-record-footer">
			<div class="voice-record-footer-left">
				<ElSpacePro :size="8">
					<el-button
						v-show="['idle', 'stopped'].includes(state)"
						class="record-btn"
						:icon="RiRecordCircleFill"
						@click="onStartRecord"
					>
						录制
					</el-button>
					<el-button
						v-show="!['idle', 'stopped'].includes(state)"
						class="record-btn"
						:icon="RiStopCircleFill"
						@click="onStopRecord"
					>
						停止
					</el-button>
					<el-button
						v-show="state === 'recording'"
						:icon="RiPauseCircleFill"
						@click="onPauseRecord"
					>
						暂停
					</el-button>
					<el-button v-show="state === 'paused'" :icon="RiPlayCircleFill" @click="onResumeRecord">
						继续
					</el-button>
				</ElSpacePro>
			</div>
			<div class="voice-record-footer-right">
				<ElSpacePro :size="8">
					<span class="record-duration">{{ duration }}</span>
					<el-select class="record-select" v-model="recordDevice" placeholder="请选择录音设备">
						<el-option
							v-for="item in recordOptions"
							:key="item.label"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</ElSpacePro>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";
import {
	useWaveSurferRecord,
	AudioHelper,
	type WaveSurferInstance,
	type WaveSurferThemeKey
} from "@/hooks/useWaveSurfer";
import { useAppStore } from "@/stores";
import { sleep } from "@/utils/tools";
import type { RecordUploadData } from "./types";

export type RecordOptions = Array<{
	label: string;
	value: string;
}>;

// icon
const RiRecordCircleFill = useIcon({ name: "ri-record-circle-fill", size: 16 });
const RiStopCircleFill = useIcon({ name: "ri-stop-circle-fill", size: 16 });
const RiPauseCircleFill = useIcon({ name: "ri-pause-circle-fill", size: 16 });
const RiPlayCircleFill = useIcon({ name: "ri-play-circle-fill", size: 16 });

const appStore = useAppStore();
const emit = defineEmits<{
	/** 录音上传完成 */
	"voice-upload-complete": [path: string];
}>();

// 数据
const waveformRef = useTemplateRef("waveformRef");
let recordInstance: WaveSurferInstance | undefined = void 0;
const recordDevice = ref();
const recordOptions = ref<RecordOptions>([]);
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
	resetRecord
} = useWaveSurferRecord();
const duration = computed(() => {
	const duration = recordData.duration / 1000; // ms转s
	return AudioHelper.formatDuration(duration);
});
const recordUploadData = defineModel({
	type: Object as PropType<RecordUploadData>,
	required: true
});

// 方法
/** 获取录音设备信息 */
async function getDevice() {
	if (recordDevice.value && recordOptions.value.length > 0) return;
	const devices = await getRecordDevice();
	if (devices.length <= 0) return;

	// 生成设备选项
	recordOptions.value = devices.map((device, index) => {
		if (index === 0) recordDevice.value = device.deviceId;
		return {
			label: device.label,
			value: device.deviceId
		};
	});

	// 没有设备弹出提示
	if (recordOptions.value.length <= 0) {
		ElMessage.warning("没有可用的录音设备");
	}
}
/** 开始录音 */
async function onStartRecord() {
	await getDevice();
	if (recordOptions.value.length <= 0) return;

	startRecord({
		deviceId: recordDevice.value
	});
}
/** 停止录音 */
function onStopRecord() {
	stopRecord();
}
/** 暂停录音 */
function onPauseRecord() {
	pauseRecord();
}
/** 继续录音 */
function onResumeRecord() {
	resumeRecord();
}
/** 录音完成 */
recordEmitter.on("record-end", async (blob) => {
	// 上传文件
	recordUploadData.value.loading = true;
	recordUploadData.value.isEnd = false;
	setTimeout(() => {
		recordUploadData.value.percentage = 50;
	}, 1000);
	await sleep(2000);
	recordUploadData.value.percentage = 100;
	sleep(1000).then(() => {
		recordUploadData.value.percentage = 0;
		// 重置
		resetRecord();
	});

	// 上传完成
	recordUploadData.value.isEnd = true;
	recordUploadData.value.loading = false;
	const audioUrl = URL.createObjectURL(blob);
	recordUploadData.value.path = audioUrl;

	emit("voice-upload-complete", audioUrl);

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
});

/** 监听主题 */
watchEffect(() => {
	if (!recordInstance) return;
	const theme: WaveSurferThemeKey = appStore.isDark ? "dark" : "light";
	toggleTheme(theme);
});

onMounted(() => {
	getDevice();
	if (!waveformRef.value) return;
	recordInstance = initRecord({
		container: waveformRef.value,
		theme: appStore.isDark ? "dark" : "light"
	});
});

onUnmounted(() => {
	destroyRecord();
});
</script>

<style lang="scss" scoped>
@use "sass:math";
.voice-record {
	height: var(--voice-reference-content-height);
}
.waveform-container {
	border: 1px solid var(--el-border-color);
	border-radius: 6px;
	padding: $zl-padding;
	height: calc(100% - 37px);
	position: relative;
	overflow: hidden;
}
.record-waveform {
	height: 100%;
	position: relative;
	z-index: 1;
}
.record-upload {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 2;
	display: flex;
	background-color: var(--el-bg-color);
}
.record-upload-progress {
	margin: auto;
}
.voice-record-footer {
	margin-top: 5px;
	height: 32px;
	display: flex;
	font-size: 14px;
}
.voice-record-footer-left {
	flex-grow: 1;
	min-width: 0;
}
.record-btn :deep(.el-icon),
.record-btn :deep(.el-icon) {
	color: var(--el-color-danger);
}
.voice-record-footer-right {
	flex-shrink: 0;
}
.record-duration {
	color: var(--el-text-color-regular);
}
.record-select {
	min-width: 200px;
}
</style>
