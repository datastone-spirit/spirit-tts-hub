<!--
 * @Author: mulingyuer
 * @Date: 2025-10-15 15:35:41
 * @LastEditTime: 2025-11-05 15:42:10
 * @LastEditors: mulingyuer
 * @Description: 参考语音
 * @FilePath: \frontend\src\views\index-tts2\components\VoiceReference.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="voice-reference">
		<el-tabs class="voice-tab" v-model="voiceType" @tab-change="onTabChange">
			<el-tab-pane name="upload">
				<template #label>
					<div class="voice-tab-label">
						<Icon class="voice-tab-label-icon" name="ri-upload-2-line" />
						<span>上传</span>
					</div>
				</template>
				<AudioUpload
					v-show="showAudioUpload"
					ref="audioUploadRef"
					@audio-uploaded="onAudioUploaded"
				/>
			</el-tab-pane>
			<el-tab-pane name="record">
				<template #label>
					<div class="voice-tab-label">
						<Icon class="voice-tab-label-icon" name="ri-mic-line" />
						<span>录音</span>
					</div>
				</template>
				<AudioRecorder
					v-show="showAudioRecorder"
					ref="audioRecorderRef"
					@audio-recorded="onAudioRecorded"
				/>
			</el-tab-pane>
			<el-tab-pane name="select-file">
				<template #label>
					<div class="voice-tab-label">
						<Icon class="voice-tab-label-icon" name="ri-file-music-line" />
						<span>文件</span>
					</div>
				</template>
				<el-form
					v-show="showAudioFileSelect"
					ref="localRuleFormRef"
					:model="localRuleForm"
					:rules="localRules"
					size="large"
				>
					<el-form-item prop="audioPath">
						<AudioFileSelect
							v-model="localRuleForm.audioPath"
							@file-picker-confirm="onFilePickerConfirm"
						/>
					</el-form-item>
				</el-form>
			</el-tab-pane>
		</el-tabs>

		<!-- 音频预览 -->
		<AudioPlayer
			v-show="showAudioPlayer"
			ref="audioPlayerRef"
			:audio-path="audioPath"
			@region-start="onRegionStart"
			@region-reset="onRegionReset"
			@region-uploaded="onRegionUploaded"
			@clear="onAudioPlayerClear"
		/>
	</div>
</template>

<script setup lang="ts">
import type { FileResult } from "@/api/common";
import { useSettingsStore } from "@/stores";
import type { FormRules, TabPaneName, UploadUserFile } from "element-plus";

/** 音频类型 */
export type VoiceType =
	| "upload" // 上传
	| "record" // 录音
	| "select-file"; // 选择文件

export interface LocalRuleForm {
	audioPath: string;
}

const settingsStore = useSettingsStore();

const audioPath = defineModel("audio-path", { type: String, required: true });

const voiceType = ref<VoiceType>("upload");
const audioUploadRef = useTemplateRef("audioUploadRef");
const audioPlayerRef = useTemplateRef("audioPlayerRef");
const audioRecorderRef = useTemplateRef("audioRecorderRef");
const originalAudioPath = ref<string>(); // 还原用的数据
const localRuleFormRef = useTemplateRef("localRuleFormRef");
const defaultLocalRuleForm = readonly<LocalRuleForm>({
	audioPath: settingsStore.whiteCheck ? settingsStore.appSettings.uploadPath : ""
});
const localRuleForm = ref<LocalRuleForm>(structuredClone(toRaw(defaultLocalRuleForm)));
const localRules = reactive<FormRules<LocalRuleForm>>({});

const showAudioUpload = computed(() => {
	return voiceType.value === "upload" && !audioPath.value;
});
const showAudioRecorder = computed(() => {
	return voiceType.value === "record" && !audioPath.value;
});
const showAudioPlayer = computed(() => {
	return typeof audioPath.value === "string" && audioPath.value.trim() !== "";
});
const showAudioFileSelect = computed(() => {
	return voiceType.value === "select-file" && !audioPath.value;
});

/** tab 切换 */
function onTabChange(name: TabPaneName) {
	if (name === "upload") {
		audioRecorderRef.value?.cancelRecord(); // 取消正在进行的录音
	}
	audioPath.value = "";
}
/** 音频上传完成 */
const onAudioUploaded = (file: UploadUserFile) => {
	audioPath.value = file.url!;
};
/** 音频录制完成 */
const onAudioRecorded = (data: UploadUserFile) => {
	audioPath.value = data.url!;
};
/** 开始裁剪 */
const onRegionStart = () => {
	if (originalAudioPath.value) return;
	originalAudioPath.value = audioPath.value;
};
/** 裁剪完成 */
const onRegionUploaded = (data: UploadUserFile) => {
	audioPath.value = data.url!;
};
/** 裁剪还原 */
const onRegionReset = () => {
	if (!originalAudioPath.value) return;
	audioPath.value = originalAudioPath.value;

	originalAudioPath.value = void 0;
};
/** 文件选择完成 */
const onFilePickerConfirm = (data: FileResult) => {
	audioPath.value = data.path;
};

/** 清理播放 */
function onAudioPlayerClear() {
	audioPath.value = "";
	audioRecorderRef.value?.reset();
}

defineExpose({
	/** 重置数据 */
	reset() {
		audioPath.value = "";
		originalAudioPath.value = void 0;

		audioUploadRef.value?.reset();
		audioPlayerRef.value?.reset();
		audioRecorderRef.value?.reset();
		localRuleForm.value = structuredClone(toRaw(defaultLocalRuleForm));
		localRuleFormRef.value?.resetFields();
	}
});
</script>

<style lang="scss" scoped>
.voice-reference {
	width: 100%;
}
.voice-tab {
	:deep(.el-tabs__header) {
		@include no-select();
	}
}
.voice-tab-label {
	display: flex;
	align-items: center;
	padding: 0 5px;
}
.voice-tab-label-icon {
	margin-right: 6px;
}
.local-path {
	width: 100%;
	height: 165px;
}
.local-path-info {
	padding: 8px;
	:deep(ol) {
		padding-inline-start: 24px;
		font-size: 14px;
		line-height: 24px;
	}
}
</style>
