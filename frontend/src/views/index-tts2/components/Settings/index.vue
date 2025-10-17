<!--
 * @Author: mulingyuer
 * @Date: 2025-10-16 11:38:02
 * @LastEditTime: 2025-10-17 11:57:31
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
			<el-form-item label="情感控制方法" prop="emotionControlStrategy">
				<el-select v-model="ruleForm.emotionControlStrategy" placeholder="请选择情感控制方法">
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

			<template v-if="ruleForm.emotionControlStrategy === 'use_emotion_audio'">
				<el-form-item label="情感参考音频" prop="useEmotionAudioPath">
					<VoiceReference v-model:audio-path="ruleForm.emotionReferenceAudioPath" />
				</el-form-item>
				<el-form-item label="情感控制权重" prop="useEmotionAudioPath">
					<ValueSlider v-model="ruleForm.externalEmotionStrength" :min="0" :max="1" :step="0.1" />
				</el-form-item>
			</template>

			<template v-if="ruleForm.emotionControlStrategy === 'use_emotion_vectors'">
				<el-form-item label="随机情绪采样" prop="randomEmotion">
					<el-switch v-model="ruleForm.enableRandomEmotion" />
				</el-form-item>
				<el-form-item class="emotion-strengths" label="情绪权重">
					<EmotionRadar v-model="ruleForm.emotionStrengths" />
					<el-form-item
						class="emotion-strengths-item"
						label="快乐"
						prop="emotionStrengths.happy"
						label-position="left"
					>
						<EmotionSlider v-model="ruleForm.emotionStrengths.happy" :reset-default="0" />
					</el-form-item>
					<el-form-item
						class="emotion-strengths-item"
						label="生气"
						prop="emotionStrengths.angry"
						label-position="left"
					>
						<EmotionSlider v-model="ruleForm.emotionStrengths.angry" :reset-default="0" />
					</el-form-item>
					<el-form-item
						class="emotion-strengths-item"
						label="难过"
						prop="emotionStrengths.sad"
						label-position="left"
					>
						<EmotionSlider v-model="ruleForm.emotionStrengths.sad" :reset-default="0" />
					</el-form-item>
					<el-form-item
						class="emotion-strengths-item"
						label="害怕"
						prop="emotionStrengths.afraid"
						label-position="left"
					>
						<EmotionSlider v-model="ruleForm.emotionStrengths.afraid" :reset-default="0" />
					</el-form-item>
					<el-form-item
						class="emotion-strengths-item"
						label="厌恶"
						prop="emotionStrengths.disgusted"
						label-position="left"
					>
						<EmotionSlider v-model="ruleForm.emotionStrengths.disgusted" :reset-default="0" />
					</el-form-item>
					<el-form-item
						class="emotion-strengths-item"
						label="忧郁"
						prop="emotionStrengths.melancholic"
						label-position="left"
					>
						<EmotionSlider v-model="ruleForm.emotionStrengths.melancholic" :reset-default="0" />
					</el-form-item>
					<el-form-item
						class="emotion-strengths-item"
						label="惊讶"
						prop="emotionStrengths.surprised"
						label-position="left"
					>
						<EmotionSlider v-model="ruleForm.emotionStrengths.surprised" :reset-default="0" />
					</el-form-item>
					<el-form-item
						class="emotion-strengths-item"
						label="平静"
						prop="emotionStrengths.calm"
						label-position="left"
					>
						<EmotionSlider v-model="ruleForm.emotionStrengths.calm" :reset-default="0" />
					</el-form-item>
				</el-form-item>
			</template>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import type { RuleForm } from "../../types";
import { useSettingsStore } from "@/stores";
import VoiceReference from "../VoiceReference.vue";
import EmotionSlider from "./EmotionSlider.vue";
import EmotionRadar from "./EmotionRadar/index.vue";

const ruleForm = defineModel("ruleForm", { type: Object as PropType<RuleForm>, required: true });
const ruleFormRef = useTemplateRef<FormInstance>("ruleFormRef");
const rules = reactive<FormRules<RuleForm>>({});

const settingsStore = useSettingsStore();

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
</script>

<style lang="scss" scoped>
.setting {
	padding: 16px;
}
.emotion-strengths > :deep(.el-form-item__content) {
	padding: $zl-padding;
}
.emotion-strengths-item {
	width: 100%;
	:deep(.el-form-item__label) {
		margin-bottom: 0;
		line-height: 40px;
	}
}
</style>
