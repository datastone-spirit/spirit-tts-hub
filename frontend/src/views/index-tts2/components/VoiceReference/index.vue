<!--
 * @Author: mulingyuer
 * @Date: 2025-09-26 16:17:19
 * @LastEditTime: 2025-10-14 15:12:51
 * @LastEditors: mulingyuer
 * @Description: 参考语音
 * @FilePath: \frontend\src\views\index-tts2\components\VoiceReference\index.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="voice-reference">
		<div class="voice-reference-title">
			<Icon class="voice-reference-icon" name="ri-music-2-fill" :size="22" />
			<span>参考音频</span>
		</div>
		<div class="voice-reference-content">
			<VoiceUpload
				v-show="showVoiceUpload"
				key="upload"
				ref="uploadRef"
				v-model="uploadData"
				@upload-success="onUploadSuccess"
			/>
			<AudioPlayer
				v-show="showAudioPlayer"
				key="player"
				ref="audioPlayerRef"
				v-model:audio-data="audioData"
				:path="audioData.path"
				@clear="onAudioPlayerClear"
				@region-complete="onAudioPlayerRegionComplete"
			/>
			<VoiceRecord
				v-show="showVoiceRecord"
				key="record"
				ref="recordRef"
				v-model="recordUploadData"
				@voice-upload-complete="onVoiceUploadComplete"
			/>
		</div>
		<div class="voice-reference-footer">
			<el-space class="voice-type" :size="8">
				<el-button
					:type="voiceType === 'upload' ? 'primary' : 'default'"
					:icon="RiUpload_2Line"
					@click="onVoiceType('upload')"
				>
					上传
				</el-button>
				<el-button
					:type="voiceType === 'record' ? 'primary' : 'default'"
					:icon="RiMicLine"
					@click="onVoiceType('record')"
				>
					录音
				</el-button>
			</el-space>
			<div class="voice-control">
				<el-space v-show="!audioData.loading" :size="20">
					<RewindButton @click="onRewind" />
					<PlayPauseButton :isPlaying="isPlaying" @click="onPlayPause" />
					<SkipButton @click="onFastForward" />
				</el-space>
			</div>
			<div v-show="showAudioPlayer" class="voice-other">
				<ElSpacePro :size="8">
					<el-button v-show="!audioData.isRegion" :icon="RiScissorsLine" @click="onVoiceRegion">
						裁剪
					</el-button>
					<el-button
						v-show="!audioData.isRegion"
						:icon="RiArrowGoBackLine"
						@click="onVoiceReginReset"
					>
						还原
					</el-button>
					<el-button v-show="audioData.isRegion" :icon="RiCheckLine" @click="onVoiceRegionConfirm">
						确认
					</el-button>
					<el-button
						class="cancel"
						v-show="audioData.isRegion"
						:icon="RiCloseFill"
						@click="onVoiceReginCancel"
					>
						取消
					</el-button>
				</ElSpacePro>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";
import VoiceUpload from "./VoiceUpload.vue";
import type { VoiceType, UploadData, AudioData, RecordUploadData } from "./types";
import AudioPlayer from "./AudioPlayer.vue";
import VoiceRecord from "./VoiceRecord.vue";

// icon
const RiScissorsLine = useIcon({ name: "ri-scissors-line", size: 14 });
const RiArrowGoBackLine = useIcon({ name: "ri-arrow-go-back-line", size: 14 });
const RiUpload_2Line = useIcon({ name: "ri-upload-2-line", size: 14 });
const RiMicLine = useIcon({ name: "ri-mic-line", size: 14 });
const RiCheckLine = useIcon({ name: "ri-check-line", size: 14 });
const RiCloseFill = useIcon({ name: "ri-close-fill", size: 14 });

const voiceType = ref<VoiceType>("record");
function onVoiceType(type: VoiceType) {
	if (type === voiceType.value) return;
	onAudioPlayerClear();
	voiceType.value = type;
}

const uploadRef = useTemplateRef("uploadRef");
const uploadData = reactive<UploadData>({
	path: "",
	loading: false,
	percentage: 0,
	isEnd: false
});
const audioPlayerRef = useTemplateRef<InstanceType<typeof AudioPlayer>>("audioPlayerRef");
const audioData = reactive<AudioData>({
	path: "",
	originPath: void 0,
	state: "idle",
	isRegion: false,
	loading: false
});
const recordRef = useTemplateRef("recordRef");
const recordUploadData = reactive<RecordUploadData>({
	path: "",
	loading: false,
	percentage: 0,
	isEnd: false
});
const isPlaying = computed(() => audioData.state === "playing");
const showVoiceUpload = computed(() => {
	return voiceType.value === "upload" && !uploadData.isEnd;
});
const showAudioPlayer = computed(() => {
	switch (voiceType.value) {
		case "upload":
			return uploadData.isEnd;
		case "record":
			return recordUploadData.isEnd;
		default:
			return false;
	}
});
const showVoiceRecord = computed(() => {
	return voiceType.value === "record" && !recordUploadData.isEnd;
});

// 音频控制
function onRewind() {
	audioPlayerRef.value?.rewind();
}
function onPlayPause() {
	audioPlayerRef.value?.playPause();
}
function onFastForward() {
	audioPlayerRef.value?.fastForward();
}
function onVoiceRegion() {
	audioPlayerRef.value?.addRegion();
}
function onVoiceReginReset() {
	audioPlayerRef.value?.clear();
	if (audioData.originPath) {
		audioData.path = audioData.originPath;
		audioData.originPath = void 0;
	}
}
function onVoiceReginCancel() {
	audioPlayerRef.value?.deleteRegion();
}
function onVoiceRegionConfirm() {
	// 裁剪前记录原始数据
	if (!audioData.originPath) {
		audioData.originPath = audioData.path;
	}
	audioPlayerRef.value?.cut();
}
function onAudioPlayerClear() {
	audioPlayerRef.value?.stop();
	Object.assign(audioData, {
		path: "",
		state: "idle",
		isRegion: false,
		loading: true
	});

	switch (voiceType.value) {
		case "upload":
			Object.assign(uploadData, {
				path: "",
				loading: false,
				percentage: 0,
				isEnd: false
			});
			break;
		case "record":
			Object.assign(recordUploadData, {
				path: "",
				loading: false,
				percentage: 0,
				isEnd: false
			});
			break;
	}
}
function onAudioPlayerRegionComplete(url: string) {
	audioData.path = url;
}

/** 文件上传成功 */
function onUploadSuccess(url: string) {
	audioData.path = url;
}
/** 录音上传完成 */
function onVoiceUploadComplete(url: string) {
	audioData.path = url;
}
</script>

<style lang="scss" scoped>
.voice-reference {
	padding: $zl-padding * 2;
	padding-bottom: 0;
}
.voice-reference-title {
	margin-bottom: $zl-padding;
	font-size: 20px;
	font-weight: bold;
	color: var(--el-text-color-primary);
	display: flex;
	align-items: center;
}
.voice-reference-icon {
	margin-right: 10px;
	color: var(--el-color-primary);
}
.voice-reference-content {
	--voice-reference-content-height: 126px;
}
.voice-reference-footer {
	display: flex;
	align-items: center;
	margin-top: $zl-padding;
}
.voice-type,
.voice-other {
	min-width: 200px;
}
.voice-type {
	flex-shrink: 0;
	justify-content: flex-start;
}
.voice-type,
.voice-other {
	:deep(.el-button) {
		border-radius: 8px;
		box-shadow: 0px 0px 4px var(--zl-box-shadow);
	}
	:deep(.el-button:not(.el-button--primary) .el-icon) {
		color: var(--el-color-primary);
	}
	:deep(.el-button.cancel .el-icon) {
		color: var(--el-color-danger);
	}
}
.voice-control {
	flex-grow: 1;
	min-width: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12px;
}
.voice-other {
	flex-shrink: 0;
	text-align: right;
}
</style>
