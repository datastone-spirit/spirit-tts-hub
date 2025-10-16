<!--
 * @Author: mulingyuer
 * @Date: 2025-09-19 16:20:41
 * @LastEditTime: 2025-10-16 16:42:13
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
							<BodyCard title="参考音频" icon-name="ri-music-2-fill">
								<VoiceReference v-model:audio-path="ruleForm.referenceAudioPath" />
							</BodyCard>
							<el-divider class="tts-divider" />
							<BodyCard title="文本转语音" icon-name="ri-text">
								<TtsInput :loading="generateLoading" @confirm="onConfirm" />
							</BodyCard>
							<el-divider class="tts-divider" />
							<BodyCard title="文本分段设置" icon-name="ri-scissors-cut-fill">
								<TextSegSettings v-model="ruleForm.maxTokensPerSegment" />
							</BodyCard>
						</div>
					</div>
				</el-splitter-panel>
				<el-splitter-panel v-model:size="rightSize" :min="430">
					<div class="tts-control">
						<el-tabs v-model="activeName" class="tts-control-tabs">
							<el-tab-pane name="settings" class="tts-control-tabs-panel">
								<template #label>
									<div class="tts-control-label">
										<Icon name="ri-equalizer-fill" />
										<span>调试台</span>
									</div>
								</template>
								<Settings v-model:rule-form="ruleForm" />
							</el-tab-pane>
							<el-tab-pane label="高级设置" name="advanced">
								<template #label>
									<div class="tts-control-label">
										<Icon name="ri-settings-3-fill" />
										<span>高级设置</span>
									</div>
								</template>
								<Advanced v-model:rule-form="ruleForm" />
							</el-tab-pane>
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
import Advanced from "./components/Advanced/index.vue";
import Settings from "./components/Settings/index.vue";
import type { RuleForm } from "./types";
import BodyCard from "./components/BodyCard.vue";

export type TabsName = "settings" | "advanced";

// icon
const RiLightbulbLine = useIcon({ name: "ri-lightbulb-line" });
const RiHistoryLine = useIcon({ name: "ri-history-line" });

const leftSize = useLocalStorage(SPLITTER_KEY.INDEX_TTS2_LEFT_SIZE, 1200);
const rightSize = useLocalStorage(SPLITTER_KEY.INDEX_TTS2_RIGHT_SIZE, 600);
const ruleForm = reactive<RuleForm>({
	referenceAudioPath: "",
	text: "",
	maxTokensPerSegment: 120,
	emotionControlStrategy: "use_emotion_vectors",
	emotionReferenceAudioPath: "",
	externalEmotionStrength: 0.8,
	enableRandomEmotion: false,
	emotionStrengths: {
		happy: 0,
		angry: 0,
		sad: 0,
		afraid: 0,
		disgusted: 0,
		melancholic: 0,
		surprised: 0,
		calm: 0
	}
});
const generateLoading = ref(false);
const generateAudioPath = ref("");
const activeName = ref<TabsName>("settings");

/** 生成音频 */
async function onConfirm(text: string) {
	// 检测有没有输入音频文件
	if (
		typeof ruleForm.referenceAudioPath !== "string" ||
		ruleForm.referenceAudioPath.trim() === ""
	) {
		ElMessage.error("请配置参考音频");
		return;
	}

	ruleForm.text = text;

	// 生成中
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
	height: 57px;
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
.tts-control-tabs {
	--el-tabs-header-height: 57px;
	> :deep(.el-tabs__header) {
		margin-bottom: 0;
	}
	> :deep(.el-tabs__header .el-tabs__item) {
		padding: 0 10px;
	}
}
.tts-control-label {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 0 20px;
}
</style>
