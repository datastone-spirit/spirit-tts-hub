<!--
 * @Author: mulingyuer
 * @Date: 2025-10-16 11:38:02
 * @LastEditTime: 2025-10-30 11:39:55
 * @LastEditors: mulingyuer
 * @Description: 调试台
 * @FilePath: \frontend\src\views\index-tts2\components\Settings\index.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="setting">
		<el-form
			class="zl-el-form-label-top"
			ref="ruleFormRef"
			:model="ruleForm"
			:rules="rules"
			label-position="top"
			label-suffix="："
			size="large"
		>
			<el-form-item label="情感控制方式" prop="emo_control_method">
				<el-select v-model="ruleForm.emo_control_method" placeholder="请选择情感控制方式">
					<el-option
						:label="getEmoControlMethodLabel(EMO_CONTROL_METHOD.SAME_AS_VOICE)"
						:value="EMO_CONTROL_METHOD.SAME_AS_VOICE"
					/>
					<el-option
						:label="getEmoControlMethodLabel(EMO_CONTROL_METHOD.USE_EMOTION_AUDIO)"
						:value="EMO_CONTROL_METHOD.USE_EMOTION_AUDIO"
					/>
					<el-option
						:label="getEmoControlMethodLabel(EMO_CONTROL_METHOD.USE_EMOTION_VECTORS)"
						:value="EMO_CONTROL_METHOD.USE_EMOTION_VECTORS"
					/>
					<el-option
						v-if="settingsStore.isExpert"
						:label="getEmoControlMethodLabel(EMO_CONTROL_METHOD.USE_TEXT_DESCRIPTION)"
						:value="EMO_CONTROL_METHOD.USE_TEXT_DESCRIPTION"
					/>
				</el-select>
			</el-form-item>

			<el-form-item
				v-show="ruleForm.emo_control_method === EMO_CONTROL_METHOD.USE_EMOTION_AUDIO"
				label="情感参考音频"
				prop="emo_ref_path"
			>
				<VoiceReference ref="voiceReferenceRef" v-model:audio-path="ruleForm.emo_ref_path" />
				<el-input v-show="false" v-model="ruleForm.emo_ref_path" />
			</el-form-item>

			<el-form-item v-show="showEnableRandomEmotion" label="随机情绪采样" prop="emo_random">
				<el-switch v-model="ruleForm.emo_random" />
			</el-form-item>

			<el-form-item
				v-show="ruleForm.emo_control_method === EMO_CONTROL_METHOD.USE_EMOTION_VECTORS"
				class="emotion-strengths"
				label="情绪权重"
			>
				<EmotionRadar
					v-model="ruleForm"
					:change-type="emotionChangeType"
					@change="onEmotionRadarChange"
				/>
				<EmotionSlider v-model="ruleForm" @change="onEmotionSliderChange" />
			</el-form-item>

			<el-form-item
				v-show="ruleForm.emo_control_method === EMO_CONTROL_METHOD.USE_TEXT_DESCRIPTION"
				label="情感描述"
				prop="prompt"
			>
				<el-space fill style="width: 100%">
					<el-input
						v-model="ruleForm.prompt"
						:autosize="{ minRows: 3, maxRows: 8 }"
						type="textarea"
						placeholder="请输入情绪描述（或留空自动使用主文本提示）"
					/>
					<el-alert type="info" :closable="false"> 例如：非常悲伤，危险正在悄悄逼近 </el-alert>
				</el-space>
			</el-form-item>

			<el-form-item v-show="showExternalEmotionStrength" label="情感控制权重" prop="emo_weight">
				<NumericRangeControl
					v-model="ruleForm.emo_weight"
					:min="0"
					:max="1"
					:step="0.1"
					:reset-default="0.8"
				/>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { EMO_CONTROL_METHOD } from "@/api/index-tts2";
import { useSettingsStore } from "@/stores";
import { validateForm } from "@/utils/tools";
import type { FormInstance } from "element-plus";
import { usePageForm } from "../../composables/usePageForm";
import { getEmoControlMethodLabel } from "../../helper";
import type { RuleForm } from "../../types";
import VoiceReference from "../VoiceReference.vue";
import EmotionRadar from "./EmotionRadar.vue";
import EmotionSlider from "./EmotionSlider.vue";
import type { EmotionChangeType } from "./types";

const settingsStore = useSettingsStore();

const { ruleForm, rules, registerValidator, registerResetter } = usePageForm();
const voiceReferenceRef = useTemplateRef("voiceReferenceRef");
const ruleFormRef = useTemplateRef<FormInstance>("ruleFormRef");
const emotionChangeType = ref<EmotionChangeType>("none");
/** 显示随机情绪采样 */
const showEnableRandomEmotion = computed(() => {
	return [EMO_CONTROL_METHOD.USE_EMOTION_VECTORS, EMO_CONTROL_METHOD.USE_TEXT_DESCRIPTION].includes(
		ruleForm.value.emo_control_method
	);
});
/** 显示情感控制权重 */
const showExternalEmotionStrength = computed(() => {
	return [EMO_CONTROL_METHOD.USE_EMOTION_AUDIO, EMO_CONTROL_METHOD.USE_TEXT_DESCRIPTION].includes(
		ruleForm.value.emo_control_method
	);
});

/** 情绪权重雷达图change */
function onEmotionRadarChange(_key: keyof RuleForm, _value: number) {
	emotionChangeType.value = "EmotionRadar";
}
/** 情绪权重滑块change */
function onEmotionSliderChange(_key: keyof RuleForm, _value: number) {
	emotionChangeType.value = "EmotionSlider";
}

/** 监听专家模式切换 */
watch(
	() => settingsStore.isExpert,
	(value) => {
		// 从专家切回普通，如果选择了专家选项，还原成默认选项
		if (!value && ruleForm.value.emo_control_method === EMO_CONTROL_METHOD.USE_TEXT_DESCRIPTION) {
			ruleForm.value.emo_control_method = EMO_CONTROL_METHOD.SAME_AS_VOICE;
		}
	}
);

// 注册表单验证器
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
</script>

<style lang="scss" scoped>
.setting {
	padding: 16px;
}
.emotion-strengths > :deep(.el-form-item__content) {
	padding: $zl-padding;
}
</style>
