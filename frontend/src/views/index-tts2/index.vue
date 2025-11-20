<!--
 * @Author: mulingyuer
 * @Date: 2025-09-19 16:20:41
 * @LastEditTime: 2025-11-20 17:27:40
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
							<el-space :size="8">
								<el-button :icon="RiLightbulbLine" @click="onViewExample">示例</el-button>
								<el-button :icon="RiHistoryLine" @click="onViewHistory">历史</el-button>
								<el-button type="info" :icon="RiUserStarLine" plain @click="onViewRole">
									角色
								</el-button>
							</el-space>
						</div>
						<div class="tts-main-body">
							<el-form ref="ruleFormRef" :model="ruleForm" :rules="rules">
								<BodyCard title="参考音频" icon-name="ri-music-2-fill">
									<VoiceReference
										ref="voiceReferenceRef"
										v-model:audio-path="ruleForm.spk_audio_prompt"
									/>
									<el-form-item prop="spk_audio_prompt">
										<el-input v-show="false" v-model="ruleForm.spk_audio_prompt" />
									</el-form-item>
								</BodyCard>
								<el-divider class="tts-divider" />
								<BodyCard title="文本转语音" icon-name="ri-text" :description="textLength">
									<el-form-item prop="text">
										<el-input
											class="tts-text-input"
											v-model="ruleForm.text"
											type="textarea"
											placeholder="请输入要合成的文本"
											:autosize="{ minRows: 8, maxRows: 15 }"
										/>
									</el-form-item>
								</BodyCard>
								<el-divider class="tts-divider" />
								<BodyCard title="文本分段设置" icon-name="ri-scissors-cut-fill">
									<el-form-item prop="max_text_tokens_per_segment">
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
				:show-progress="showProgress"
				:progress="progress"
				:generate-time="generateTime"
			>
				<template #footer-right>
					<el-button
						class="footer-button reset"
						:disabled="generateLoading || saveRoleLoading"
						@click="onResetForm"
					>
						重置表单
					</el-button>
					<el-button
						class="footer-button save"
						type="info"
						:loading="saveRoleLoading"
						:disabled="generateLoading"
						plain
						@click="onSaveRole"
					>
						保存角色
					</el-button>
					<el-button
						class="footer-button submit"
						type="primary"
						:disabled="saveRoleLoading"
						:loading="generateLoading"
						:icon="RiMusicAiFill"
						@click="onSubmitForm"
					>
						生成语音
					</el-button>
				</template>
			</FooterAudio>
		</div>
		<ExampleDrawer v-model="showExampleDrawer" @apply-example="onApplyExample" />
		<HistoryDrawer v-model="showHistoryDrawer" @apply-history="onApplyHistory" />
		<RoleDrawer v-model="showRoleDrawer" @apply-role="onApplyRole" />
	</div>
</template>

<script setup lang="ts">
import { textToSpeech } from "@/api/index-tts2";
import { SPLITTER_KEY } from "@/constants/config-keys";
import { ComplexityEnum } from "@/enums/complexity.enum";
import { useIcon } from "@/hooks/useIcon";
import { useProgress } from "@/hooks/useProgress";
import { useTimer } from "@/hooks/useTimer";
import { useSettingsStore } from "@/stores";
import { getStringLength, validateForm } from "@/utils/tools";
import type { FormInstance } from "element-plus";
import Advanced from "./components/Advanced/index.vue";
import BodyCard from "./components/BodyCard.vue";
import ExampleDrawer from "./components/ExampleDrawer/index.vue";
import FooterAudio from "./components/FooterAudio.vue";
import HistoryDrawer from "./components/HistoryDrawer/index.vue";
import Settings from "./components/Settings/index.vue";
import TextSegSettings from "./components/TextSegSettings.vue";
import VoiceReference from "./components/VoiceReference.vue";
import { usePageForm } from "./composables/usePageForm";
import type { ExampleItem, RoleData, TTSHistoryItem } from "./types";
import RoleDrawer from "./components/Role/RoleDrawer.vue";
import { createRole } from "@/api/roles";
import RoleNameDialog from "./components/Role/RoleNameDialog.vue";
import type { RuleForm as RoleNameDialogForm } from "./components/Role/RoleNameDialog.vue";
import { useModal } from "@/hooks/useModal";
import { useRoleForm } from "./composables/useRoleForm";

export type TabsName = "settings" | "advanced";

const settingsStore = useSettingsStore();

// icon
const RiLightbulbLine = useIcon({ name: "ri-lightbulb-line" });
const RiHistoryLine = useIcon({ name: "ri-history-line" });
const RiUserStarLine = useIcon({ name: "ri-user-star-line" });
const RiMusicAiFill = useIcon({ name: "ri-music-ai-fill", size: 16 });

const leftSize = useLocalStorage(SPLITTER_KEY.INDEX_TTS2_LEFT_SIZE, 1200);
const rightSize = useLocalStorage(SPLITTER_KEY.INDEX_TTS2_RIGHT_SIZE, 600);
const activeName = ref<TabsName>("settings");
const voiceReferenceRef = useTemplateRef("voiceReferenceRef");
const ruleFormRef = useTemplateRef<FormInstance>("ruleFormRef");
const {
	ruleForm,
	rules,
	registerValidator,
	registerResetter,
	validateAll,
	resetAll,
	formatFormData
} = usePageForm();
const generateLoading = ref(false);
const generateAudioPath = ref("");
const showExampleDrawer = ref(false);
const showHistoryDrawer = ref(false);
const showRoleDrawer = ref(false);
const showProgress = ref(false);
const { progress, progressControl } = useProgress({
	onFinish: () => {
		showProgress.value = false;
	}
});
const textLength = computed(() => {
	return `${getStringLength(ruleForm.value.text)}字符数`;
});
const { elapsedTime: generateTime, start, pause } = useTimer();
const modal = useModal();

/** 查看示例 */
function onViewExample() {
	showExampleDrawer.value = true;
}
/** 应用示例 */
function onApplyExample(item: ExampleItem) {
	const { isExpert, ...data } = item;
	settingsStore.setComplexity(isExpert ? ComplexityEnum.EXPERT : ComplexityEnum.BEGINNER);
	Object.assign(ruleForm.value, data);

	ElMessage.success("应用示例配置成功");
}

/** 查看历史记录 */
function onViewHistory() {
	showHistoryDrawer.value = true;
}
/** 应用历史记录 */
function onApplyHistory(item: TTSHistoryItem) {
	const { isExpert, createTime, id, ...data } = item.input_config_raw;
	settingsStore.setComplexity(isExpert ? ComplexityEnum.EXPERT : ComplexityEnum.BEGINNER);
	ruleForm.value = data;
	generateAudioPath.value = item.file_path ?? generateAudioPath.value;

	ElMessage.success("应用历史记录配置成功");
}

// 角色
const { generateRoleData } = useRoleForm();
const saveRoleLoading = ref(false);
/** 查看角色 */
function onViewRole() {
	showRoleDrawer.value = true;
}
/** 应用角色 */
function onApplyRole(item: RoleData[number]) {
	const { isExpert, createTime, id, text, ...data } = item.config;
	settingsStore.setComplexity(isExpert ? ComplexityEnum.EXPERT : ComplexityEnum.BEGINNER);
	Object.assign(ruleForm.value, data);

	ElMessage.success("应用角色成功");
}
/** 保存角色 */
async function onSaveRole() {
	try {
		const { isValid } = await validateAll();
		if (!isValid) return;

		saveRoleLoading.value = true;

		const roleNameDialogForm: RoleNameDialogForm = await modal
			.open({
				component: RoleNameDialog,
				persistent: true
			})
			.catch(() => null);
		if (!roleNameDialogForm) {
			saveRoleLoading.value = false;
			return;
		}

		// api
		await createRole({
			name: roleNameDialogForm.name,
			config: generateRoleData(ruleForm.value)
		});

		ElMessage.success("保存角色成功");
		saveRoleLoading.value = false;
	} catch (error) {
		const message = `保存角色失败：${(error as Error)?.message ?? "未知错误"}`;

		saveRoleLoading.value = false;
		ElMessage.error(message);

		console.error(message, error);
	}
}

/** 重置表单 */
function onResetForm() {
	resetAll().then(() => {
		ElMessage.success("重置表单成功");
	});
}
/** 提交表单 */
async function onSubmitForm() {
	try {
		const { isValid } = await validateAll();
		if (!isValid) return;

		start();
		generateLoading.value = true;
		showProgress.value = true;
		progressControl.start(ruleForm.value.text.length);

		// api
		const data = formatFormData(ruleForm.value);
		const result = await textToSpeech(data);

		generateAudioPath.value = result.audio_path;
		generateLoading.value = false;
		progressControl.done();

		pause();
		ElMessage.success("生成成功");
	} catch (error) {
		generateLoading.value = false;
		progressControl.done();

		const message = (error as Error)?.message ?? "生成失败";
		ElMessage.error(message);
		console.error(message, error);
	}
}

/** 注册校验器 */
registerValidator(async () => {
	if (!ruleFormRef.value) return { isValid: true };
	const validResult = await validateForm(ruleFormRef.value);
	return validResult;
});

/** 注册重置 */
registerResetter(() => {
	ruleFormRef.value?.resetFields();
	voiceReferenceRef.value?.reset();
});

onUnmounted(() => {
	progressControl.clearTimer();
});
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
.tts-text-input :deep(.el-textarea__inner) {
	font-size: 16px;
	line-height: 1.6;
	color: var(--el-text-color-primary);
}
.footer-button {
	height: 100%;
}
</style>
