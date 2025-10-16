<!--
 * @Author: mulingyuer
 * @Date: 2025-10-15 15:35:41
 * @LastEditTime: 2025-10-16 15:17:15
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

/** 音频类型 */
export type VoiceType =
	| "upload" // 上传
	| "record"; // 录音

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
</script>

<style lang="scss" scoped>
.voice-reference {
	width: 100%;
}
.voice-tab-label {
	display: flex;
	align-items: center;
	padding: 0 5px;
}
.voice-tab-label-icon {
	margin-right: 6px;
}
</style>
