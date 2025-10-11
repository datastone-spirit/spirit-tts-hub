<!--
 * @Author: mulingyuer
 * @Date: 2025-10-11 17:32:45
 * @LastEditTime: 2025-10-11 23:10:11
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
					<el-button :icon="RiRecordCircleFill"> 暂停 </el-button>
					<el-button :icon="RiRecordCircleFill"> 继续 </el-button>
				</ElSpacePro>
			</div>
			<div class="voice-record-footer-right"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";

// icon
const RiRecordCircleFill = useIcon({ name: "ri-record-circle-fill", size: 16 });
const RiRecordCircleFill = useIcon({ name: "ri-record-circle-fill", size: 16 });
const RiRecordCircleFill = useIcon({ name: "ri-record-circle-fill", size: 16 });
</script>

<style lang="scss" scoped>
.voice-record {
	height: var(--voice-reference-content-height);
}
</style>
