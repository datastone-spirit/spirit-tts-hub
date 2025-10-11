<!--
 * @Author: mulingyuer
 * @Date: 2025-09-26 16:17:19
 * @LastEditTime: 2025-10-11 14:30:03
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
			<VoiceUpload v-show="!uploadData.isEnd" ref="uploadRef" v-model="uploadData" />
			<AudioPlayer
				v-show="uploadData.isEnd"
				ref="audioPlayerRef"
				v-model:audio-data="audioData"
				:path="uploadData.path"
				@clear="onAudioPlayerClear"
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
					<el-button type="text" :icon="RiRewindFill" circle text @click="onRewind" />
					<el-button
						:type="audioData.state === 'playing' ? 'danger' : 'primary'"
						:icon="audioData.state === 'playing' ? RiPauseFill : RiPlayFill"
						circle
						text
						@click="onPlayPause"
					/>
					<el-button type="text" :icon="RiSpeedFill" circle text @click="onFastForward" />
				</el-space>
			</div>
			<div v-show="uploadData.isEnd" class="voice-other">
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
import type { VoiceType, UploadData, AudioData } from "./types";
import AudioPlayer from "./AudioPlayer.vue";

// icon
const RiRewindFill = useIcon({ name: "ri-rewind-fill", size: 20 });
const RiPlayFill = useIcon({ name: "ri-play-fill", size: 32 });
const RiPauseFill = useIcon({ name: "ri-pause-fill", size: 32 });
const RiSpeedFill = useIcon({ name: "ri-speed-fill", size: 20 });
const RiScissorsLine = useIcon({ name: "ri-scissors-line", size: 14 });
const RiArrowGoBackLine = useIcon({ name: "ri-arrow-go-back-line", size: 14 });
const RiUpload_2Line = useIcon({ name: "ri-upload-2-line", size: 14 });
const RiMicLine = useIcon({ name: "ri-mic-line", size: 14 });
const RiCheckLine = useIcon({ name: "ri-check-line", size: 14 });
const RiCloseFill = useIcon({ name: "ri-close-fill", size: 14 });

const voiceType = ref<VoiceType>("upload");
function onVoiceType(type: VoiceType) {
	voiceType.value = type;
}

const uploadRef = useTemplateRef("uploadRef");
const uploadData = ref<UploadData>({
	path: "",
	loading: false,
	percentage: 0,
	isEnd: false
});
const audioPlayerRef = useTemplateRef<InstanceType<typeof AudioPlayer>>("audioPlayerRef");
const audioData = reactive<AudioData>({
	state: "idle",
	isRegion: false,
	loading: true
});
// const isPlaying = computed(() => voiceData.value.state === "playing");

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
	audioPlayerRef.value?.restore();
}
function onVoiceReginCancel() {
	audioPlayerRef.value?.deleteRegion();
}
function onVoiceRegionConfirm() {
	audioPlayerRef.value?.cut();
}
function onAudioPlayerClear() {
	switch (voiceType.value) {
		case "upload":
			uploadData.value = {
				path: "",
				loading: false,
				percentage: 0,
				isEnd: false
			};
			break;
		case "record":
			break;
	}
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
