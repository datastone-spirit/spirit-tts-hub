<!--
 * @Author: mulingyuer
 * @Date: 2025-10-11 17:32:45
 * @LastEditTime: 2025-10-12 12:26:13
 * @LastEditors: mulingyuer
 * @Description: 录音组件
 * @FilePath: \frontend\src\views\index-tts2\components\VoiceReference\VoiceRecord.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="voice-record">
		<div class="waveform-container">
			<div ref="waveformRef" class="voice-waveform"></div>
		</div>
		<div class="voice-record-footer">
			<div class="voice-record-footer-left">
				<ElSpacePro :size="8">
					<el-button :icon="RiRecordCircleFill"> 录制 </el-button>
					<el-button :icon="RiPauseCircleFill"> 暂停 </el-button>
					<el-button :icon="RiPlayCircleFill"> 继续 </el-button>
				</ElSpacePro>
			</div>
			<div class="voice-record-footer-right">
				<el-select
					class="voice-select"
					v-model="voiceRecordingEquipment"
					placeholder="请选择录音设备"
				>
					<el-option label="设备1" value="1" />
					<el-option label="设备2" value="2" />
					<el-option label="设备3" value="3" />
				</el-select>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";

// icon
const RiRecordCircleFill = useIcon({ name: "ri-record-circle-fill", size: 16 });
const RiPauseCircleFill = useIcon({ name: "ri-pause-circle-fill", size: 16 });
const RiPlayCircleFill = useIcon({ name: "ri-play-circle-fill", size: 16 });

const voiceRecordingEquipment = ref("1");
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
	height: calc(100% - 25px);
	position: relative;
	overflow: hidden;
}
.voice-record-footer {
	margin-top: 5px;
	height: 20px;
	line-height: 20px;
	display: flex;
	justify-content: space-between;
	font-size: 14px;
}
</style>
