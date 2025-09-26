<!--
 * @Author: mulingyuer
 * @Date: 2025-09-26 16:17:19
 * @LastEditTime: 2025-09-26 16:33:28
 * @LastEditors: mulingyuer
 * @Description: 参考语音
 * @FilePath: \frontend\src\views\index-tts2\components\VoiceReference\index.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="voice-reference">
		<div class="voice-reference-title">
			<Icon class="voice-reference-icon" name="ri-music-2-line" :size="22" />
			<span>参考语音</span>
		</div>
		<div class="voice-reference-content">xx</div>
		<div class="voice-reference-footer">
			<div class="voice-control">
				<el-button type="text" :icon="RiRewindFill" circle text />
				<el-button
					:type="audioState === 'playing' ? 'danger' : 'primary'"
					:icon="audioState === 'playing' ? RiPauseCircleFill : RiPlayCircleFill"
					circle
					text
				/>
				<el-button type="text" :icon="RiSpeedFill" circle text />
			</div>
			<el-space :size="6">
				<el-button :icon="RiUploadLine">上传</el-button>
				<el-button :icon="RiMicLine">录音</el-button>
			</el-space>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";

type AudioState =
	| "idle" // 空闲
	| "playing" // 播放中
	| "paused" // 暂停中
	| "ended"; // 结束

// icon
const RiUploadLine = useIcon({ name: "ri-upload-line" });
const RiMicLine = useIcon({ name: "ri-mic-line" });
const RiRewindFill = useIcon({ name: "ri-rewind-fill", size: 20 });
const RiPlayCircleFill = useIcon({ name: "ri-play-circle-fill", size: 32 });
const RiPauseCircleFill = useIcon({ name: "ri-pause-circle-fill", size: 32 });
const RiSpeedFill = useIcon({ name: "ri-speed-fill", size: 20 });

const audioState = ref<AudioState>("idle");
</script>

<style lang="scss" scoped>
.voice-reference {
	padding: $zl-padding * 2;
	padding-bottom: 0;
}
</style>
