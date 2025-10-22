<!--
 * @Author: mulingyuer
 * @Date: 2025-09-19 16:20:41
 * @LastEditTime: 2025-10-22 15:56:02
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
							<el-space :size="12">
								<el-button :icon="RiLightbulbLine" @click="onViewExample">查看示例</el-button>
								<el-button :icon="RiHistoryLine">历史记录</el-button>
							</el-space>
						</div>
						<div class="tts-main-body">
							<el-form ref="ruleFormRef" :model="ruleForm" :rules="rules">
								<BodyCard title="参考音频" icon-name="ri-music-2-fill">
									<el-form-item prop="referenceAudioPath">
										<VoiceReference v-model:audio-path="ruleForm.referenceAudioPath" />
									</el-form-item>
								</BodyCard>
								<el-divider class="tts-divider" />
								<BodyCard title="文本转语音" icon-name="ri-text">
									<el-form-item prop="text">
										<el-input
											v-model="ruleForm.text"
											type="textarea"
											placeholder="请输入要合成的文本"
											:rows="10"
										/>
									</el-form-item>
								</BodyCard>
								<el-divider class="tts-divider" />
								<BodyCard title="文本分段设置" icon-name="ri-scissors-cut-fill">
									<el-form-item prop="maxTokensPerSegment">
										<TextSegSettings />
									</el-form-item>
								</BodyCard>
							</el-form>
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
			<FooterAudio
				:audio-path="generateAudioPath"
				:loading="generateLoading"
				@reset-form="onResetForm"
				@submit-form="onSubmitForm"
			/>
		</div>
		<ExampleDrawer v-model="showExampleDrawer" @apply-example="onApplyExample" />
	</div>
</template>

<script setup lang="ts">
import { SPLITTER_KEY } from "@/constants/config-keys";
import FooterAudio from "./components/FooterAudio.vue";
import VoiceReference from "./components/VoiceReference.vue";
import { useIcon } from "@/hooks/useIcon";
import TextSegSettings from "./components/TextSegSettings.vue";
import { sleep, validateForm } from "@/utils/tools";
import templateAudio from "@/assets/audio/j816336nczz00zb3kqzxxnuve3ub5w2.ogg";
import Advanced from "./components/Advanced/index.vue";
import Settings from "./components/Settings/index.vue";
import BodyCard from "./components/BodyCard.vue";
import { usePageForm } from "./composables/usePageForm";
import type { FormInstance } from "element-plus";
import ExampleDrawer from "./components/ExampleDrawer/index.vue";
import type { ExampleItem } from "./types";
import { useSettingsStore } from "@/stores";
import { ComplexityEnum } from "@/enums/complexity.enum";

export type TabsName = "settings" | "advanced";

const settingsStore = useSettingsStore();

// icon
const RiLightbulbLine = useIcon({ name: "ri-lightbulb-line" });
const RiHistoryLine = useIcon({ name: "ri-history-line" });

const leftSize = useLocalStorage(SPLITTER_KEY.INDEX_TTS2_LEFT_SIZE, 1200);
const rightSize = useLocalStorage(SPLITTER_KEY.INDEX_TTS2_RIGHT_SIZE, 600);
const activeName = ref<TabsName>("settings");
const ruleFormRef = useTemplateRef<FormInstance>("ruleFormRef");
const { ruleForm, rules, registerValidator, registerResetter, validateAll, resetAll } =
	usePageForm();
const generateLoading = ref(false);
const generateAudioPath = ref("");
const showExampleDrawer = ref(false);

/** 查看示例 */
function onViewExample() {
	showExampleDrawer.value = true;
}
/** 应用示例 */
function onApplyExample(item: ExampleItem) {
	const { isExpert, ...data } = item;
	settingsStore.setComplexity(isExpert ? ComplexityEnum.EXPERT : ComplexityEnum.BEGINNER);
	ruleForm.value = data;
}

/** 注册校验器 */
registerValidator(async () => {
	if (!ruleFormRef.value) return { isValid: true };
	const validResult = await validateForm(ruleFormRef.value);
	return validResult;
});

/** 注册重置 */
registerResetter(() => {
	if (!ruleFormRef.value) return;
	ruleFormRef.value.resetFields();
});

/** 重置表单 */
function onResetForm() {
	resetAll();
}
/** 提交表单 */
async function onSubmitForm() {
	const { isValid } = await validateAll();
	if (!isValid) return;

	// 生成中
	generateLoading.value = true;
	await sleep(2000);
	ElMessage.success("合成成功");
	generateLoading.value = false;

	generateAudioPath.value = templateAudio;
}
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
