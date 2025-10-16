<!--
 * @Author: mulingyuer
 * @Date: 2025-09-19 16:20:41
 * @LastEditTime: 2025-10-16 10:03:37
 * @LastEditors: mulingyuer
 * @Description: index tts2
 * @FilePath: \frontend\src\views\index-tts2\index.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="tts-card">
		<div class="tts-card-content">
			<el-splitter>
				<el-splitter-panel v-model:size="leftSize" :min="500">
					<div class="tts-main">
						<div class="tts-main-head">
							<el-space :size="24">
								<el-button :icon="RiLightbulbLine">查看示例</el-button>
								<el-button :icon="RiHistoryLine">历史记录</el-button>
							</el-space>
						</div>
						<div class="tts-main-body">
							<VoiceReference v-model:audio-path="ruleForm.audioPath" />
							<el-divider class="tts-divider" />
							<TtsInput :loading="generateLoading" @confirm="onConfirm" />
							<el-divider class="tts-divider" />
							<TextSegSettings v-model="ruleForm.lineTokenCount" />
						</div>
					</div>
				</el-splitter-panel>
				<el-splitter-panel v-model:size="rightSize" :min="300">
					<div class="tts-control">
						<el-tabs v-model="activeName" class="demo-tabs">
							<el-tab-pane label="User" name="first">User</el-tab-pane>
							<el-tab-pane label="Config" name="second">Config</el-tab-pane>
							<el-tab-pane label="Role" name="third">Role</el-tab-pane>
							<el-tab-pane label="Task" name="fourth">Task</el-tab-pane>
						</el-tabs>
					</div>
				</el-splitter-panel>
			</el-splitter>
		</div>
		<div class="tts-card-footer">
			<FooterAudio :audio-path="generateAudioPath" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { SPLITTER_KEY } from "@/constants/config-keys";
import FooterAudio from "./components/FooterAudio.vue";
import VoiceReference from "./components/VoiceReference.vue";
import { useIcon } from "@/hooks/useIcon";
import TtsInput from "./components/TtsInput.vue";
import TextSegSettings from "./components/TextSegSettings.vue";
import { sleep } from "@/utils/tools";
import templateAudio from "@/assets/audio/j816336nczz00zb3kqzxxnuve3ub5w2.ogg";

// icon
const RiLightbulbLine = useIcon({ name: "ri-lightbulb-line" });
const RiHistoryLine = useIcon({ name: "ri-history-line" });

const leftSize = useLocalStorage(SPLITTER_KEY.INDEX_TTS2_LEFT_SIZE, 1200);
const rightSize = useLocalStorage(SPLITTER_KEY.INDEX_TTS2_RIGHT_SIZE, 300);
const ruleForm = reactive({
	audioPath: "",
	lineTokenCount: 120
});
const generateLoading = ref(false);
const generateAudioPath = ref("");
const activeName = ref("first");

/** 生成音频 */
async function onConfirm() {
	// 检测有没有输入音频文件
	if (typeof ruleForm.audioPath !== "string" || ruleForm.audioPath.trim() === "") {
		ElMessage.error("请配置参考音频");
		return;
	}

	generateLoading.value = true;
	await sleep(2000);
	ElMessage.success("合成成功");
	generateLoading.value = false;

	generateAudioPath.value = templateAudio;
}

// /** 音频生成成功 */
// function onGenerateComplete(path: string) {
// 	generateAudioPath.value = path;
// }
</script>

<style lang="scss" scoped>
.tts-card {
	height: 100%;
	min-width: 1px;
	display: flex;
	flex-direction: column;
}
.tts-card-content {
	flex-grow: 1;
	min-height: 1px;
}
.tts-card-footer {
	flex-shrink: 0;
	height: 100px;
	border-top: 1px solid var(--el-border-color-light);
	box-shadow: 0 0 8px var(--zl-box-shadow);
}
.tts-main-head {
	padding: $zl-padding;
	text-align: right;
	border-bottom: 1px solid var(--el-border-color-light);
}
.tts-divider {
	margin-bottom: 0;
}
.tts-main-body {
	padding-bottom: $zl-padding * 3;
}
</style>
