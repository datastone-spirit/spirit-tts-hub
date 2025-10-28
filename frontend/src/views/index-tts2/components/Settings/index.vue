<!--
 * @Author: mulingyuer
 * @Date: 2025-10-16 11:38:02
 * @LastEditTime: 2025-10-28 14:28:38
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
			<el-form-item label="情感控制方式" prop="emotionControlStrategy">
				<el-select v-model="ruleForm.emotionControlStrategy" placeholder="请选择情感控制方式">
					<el-option label="与参考音频相同" value="same_as_voice" />
					<el-option label="使用情感参考音频" value="use_emotion_audio" />
					<el-option label="使用情感向量" value="use_emotion_vectors" />
					<el-option
						v-if="settingsStore.isExpert"
						label="使用文本描述控制情感"
						value="use_text_description"
					/>
				</el-select>
			</el-form-item>

			<el-form-item
				v-show="ruleForm.emotionControlStrategy === 'use_emotion_audio'"
				label="情感参考音频"
				prop="emotionReferenceAudioPath"
			>
				<VoiceReference
					v-model:audio-path="ruleForm.emotionReferenceAudioPath"
					v-model:audio-name="ruleForm.emotionReferenceAudioName"
					v-model:local-path="ruleForm.localEmotionReferenceAudioPath"
					local-path-prop="localEmotionReferenceAudioPath"
				/>
				<el-input v-show="false" v-model="ruleForm.emotionReferenceAudioPath" />
			</el-form-item>

			<el-form-item
				v-show="showEnableRandomEmotion"
				label="随机情绪采样"
				prop="enableRandomEmotion"
			>
				<el-switch v-model="ruleForm.enableRandomEmotion" />
			</el-form-item>

			<el-form-item
				v-show="ruleForm.emotionControlStrategy === 'use_emotion_vectors'"
				class="emotion-strengths"
				label="情绪权重"
			>
				<EmotionRadar
					v-model="ruleForm.emotionStrengths"
					:change-type="emotionChangeType"
					@change="onEmotionRadarChange"
				/>
				<EmotionSlider v-model="ruleForm.emotionStrengths" @change="onEmotionSliderChange" />
			</el-form-item>

			<el-form-item
				v-show="ruleForm.emotionControlStrategy === 'use_text_description'"
				label="情感描述"
				prop="emotionDescription"
			>
				<el-space fill style="width: 100%">
					<el-input
						v-model="ruleForm.emotionDescription"
						:autosize="{ minRows: 3, maxRows: 8 }"
						type="textarea"
						placeholder="请输入情绪描述（或留空自动使用主文本提示）"
					/>
					<el-alert type="info" :closable="false"> 例如：非常悲伤，危险正在悄悄逼近 </el-alert>
				</el-space>
			</el-form-item>

			<el-form-item
				v-show="showExternalEmotionStrength"
				label="情感控制权重"
				prop="externalEmotionStrength"
			>
				<NumericRangeControl
					v-model="ruleForm.externalEmotionStrength"
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
import { useSettingsStore } from "@/stores";
import type { FormInstance } from "element-plus";
import { usePageForm } from "../../composables/usePageForm";
import type { RuleForm } from "../../types";
import VoiceReference from "../VoiceReference.vue";
import EmotionRadar from "./EmotionRadar.vue";
import EmotionSlider from "./EmotionSlider.vue";
import type { EmotionChangeType } from "./types";
import { validateForm } from "@/utils/tools";

const settingsStore = useSettingsStore();

const { ruleForm, rules, registerValidator, registerResetter } = usePageForm();
const ruleFormRef = useTemplateRef<FormInstance>("ruleFormRef");
const emotionChangeType = ref<EmotionChangeType>("none");
/** 显示随机情绪采样 */
const showEnableRandomEmotion = computed(() => {
	return ["use_emotion_vectors", "use_text_description"].includes(
		ruleForm.value.emotionControlStrategy
	);
});
/** 显示情感控制权重 */
const showExternalEmotionStrength = computed(() => {
	return ["use_emotion_audio", "use_text_description"].includes(
		ruleForm.value.emotionControlStrategy
	);
});

/** 情绪权重雷达图change */
function onEmotionRadarChange(_key: keyof RuleForm["emotionStrengths"], _value: number) {
	emotionChangeType.value = "EmotionRadar";
}
/** 情绪权重滑块change */
function onEmotionSliderChange(_key: keyof RuleForm["emotionStrengths"], _value: number) {
	emotionChangeType.value = "EmotionSlider";
}

/** 监听专家模式切换 */
watch(
	() => settingsStore.isExpert,
	(value) => {
		// 从专家切回普通，如果选择了专家选项，还原成默认选项
		if (!value && ruleForm.value.emotionControlStrategy === "use_text_description") {
			ruleForm.value.emotionControlStrategy = "same_as_voice";
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
	if (!ruleFormRef.value) return;
	ruleFormRef.value.resetFields();
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
