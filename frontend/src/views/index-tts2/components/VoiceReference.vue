<!--
 * @Author: mulingyuer
 * @Date: 2025-10-15 15:35:41
 * @LastEditTime: 2025-10-28 09:45:56
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
			</el-tab-pane>
			<el-tab-pane name="record">
				<template #label>
					<div class="voice-tab-label">
						<Icon class="voice-tab-label-icon" name="ri-mic-line" />
						<span>录音</span>
					</div>
				</template>
			</el-tab-pane>
			<el-tab-pane name="select-file">
				<template #label>
					<div class="voice-tab-label">
						<Icon class="voice-tab-label-icon" name="ri-file-music-line" />
						<span>文件</span>
					</div>
				</template>
				<el-form-item prop="localReferenceAudioPath">
					<div class="local-path">
						<el-space fill style="width: 100%">
							<FilePicker
								v-model="ruleForm.localReferenceAudioPath"
								mime-type="audio/"
								size="large"
								confirm-on-enter
								@confirm="onFilePickerConfirm"
							/>
							<el-alert class="local-path-info" type="info" :closable="false">
								<ol>
									<li>点击右侧文件图标选择音频文件。</li>
									<li>点击输入框可自行输入文件路径，回车确认。</li>
								</ol>
							</el-alert>
						</el-space>
					</div>
				</el-form-item>
			</el-tab-pane>
		</el-tabs>
		<AudioUpload v-show="showAudioUpload" v-model:file-path="audioPath" />
		<AudioRecorder
			v-show="showAudioRecorder"
			v-model:file-path="audioPath"
			ref="audioRecorderRef"
		/>
		<AudioPlayer
			v-show="showAudioPlayer"
			v-model:audio-path="audioPath"
			@clear="onAudioPlayerClear"
		/>
	</div>
</template>

<script setup lang="ts">
import type { TabPaneName } from "element-plus";
import { usePageForm } from "../composables/usePageForm";

/** 音频类型 */
export type VoiceType =
	| "upload" // 上传
	| "record" // 录音
	| "select-file"; // 选择文件

const { ruleForm } = usePageForm();
const voiceType = ref<VoiceType>("upload");
const audioPath = defineModel("audio-path", { type: String, required: true });
const audioRecorderRef = useTemplateRef("audioRecorderRef");

const showAudioUpload = computed(() => {
	return voiceType.value === "upload" && !audioPath.value;
});
const showAudioRecorder = computed(() => {
	return voiceType.value === "record" && !audioPath.value;
});
const showAudioPlayer = computed(() => {
	return typeof audioPath.value === "string" && audioPath.value.trim() !== "";
});
/** tab 切换 */
function onTabChange(name: TabPaneName) {
	if (name === "upload") {
		audioRecorderRef.value?.cancelRecord(); // 取消正在进行的录音
	}
	audioPath.value = "";
}

/** 清理播放 */
function onAudioPlayerClear() {}

function onFilePickerConfirm(data: { name: string; path: string }) {
	ruleForm.value.referenceAudioName = data.name;
	ruleForm.value.referenceAudioPath = data.path;
}
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
