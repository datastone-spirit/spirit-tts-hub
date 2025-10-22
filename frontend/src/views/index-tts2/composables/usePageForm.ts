/*
 * @Author: mulingyuer
 * @Date: 2025-10-20 15:52:11
 * @LastEditTime: 2025-10-22 09:36:33
 * @LastEditors: mulingyuer
 * @Description: 表单逻辑
 * @FilePath: \frontend\src\views\index-tts2\composables\usePageForm.ts
 * 怎么可能会有bug！！！
 */
import { useEnhancedStorage } from "@/hooks/useEnhancedStorage";
import { useFormValidator } from "@/hooks/useFormValidator";
import { joinPrefixKey } from "@/utils/tools";
import type { FormRules } from "element-plus";
import type { RuleForm } from "../types";

const { useEnhancedLocalStorage } = useEnhancedStorage();
const { registerResetterWithCleanup, registerValidatorWithCleanup, validateAll, resetAll } =
	useFormValidator();

/** 表单数据 */
const defaultForm = readonly<RuleForm>({
	referenceAudioPath: "",
	text: "",
	maxTokensPerSegment: 120,
	emotionControlStrategy: "same_as_voice",
	externalEmotionStrength: 0.8,
	enableRandomEmotion: false,
	emotionReferenceAudioPath: "",
	emotionStrengths: {
		happy: 0,
		angry: 0,
		sad: 0,
		afraid: 0,
		disgusted: 0,
		melancholic: 0,
		surprised: 0,
		calm: 0
	},
	emotionDescription: "",
	do_sample: true,
	temperature: 0.8,
	top_p: 0.8,
	top_k: 30,
	num_beams: 3,
	repetition_penalty: 10,
	length_penalty: 0,
	max_mel_tokens: 1500
});
const ruleForm = useEnhancedLocalStorage<RuleForm>({
	localKey: joinPrefixKey("index-tts2"),
	version: "1.0.0",
	defaultValue: structuredClone(toRaw(defaultForm)),
	blacklist: ["referenceAudioPath", "emotionReferenceAudioPath", "emotionStrengths.test[0]"]
});

/** 表单校验规则 */
const rules = reactive<FormRules<RuleForm>>({
	referenceAudioPath: [
		{
			trigger: "blur",
			validator: (_rule, value, callback) => {
				if (typeof value !== "string" || value.trim() === "") {
					return callback(new Error("请配置参考音频"));
				}

				callback();
			}
		}
	],
	text: [
		{ required: true, message: "请输入要合成的文本", trigger: "blur" },
		{
			trigger: "blur",
			validator: (_rule, value, callback) => {
				if (typeof value !== "string" || value.trim() === "") {
					return callback(new Error("请输入要合成的文本，且不能为空字符"));
				}

				callback();
			}
		}
	],
	emotionReferenceAudioPath: [
		{
			trigger: "change",
			validator: (_rule, value, callback) => {
				const useEmotionAudio = ruleForm.value.emotionControlStrategy === "use_emotion_audio";
				if (!useEmotionAudio) return callback();

				if (typeof value !== "string" || value.trim() === "") {
					return callback(new Error("请配置情感参考音频"));
				}

				callback();
			}
		}
	]
});

export function usePageForm() {
	/** 重置表单成功后重置表单数据
	 * 由于 ElForm 的 resetFields 方法只能重置被双向绑定的表单数据，未绑定的无法重置
	 * 所以这里手动复写表单数据
	 */
	function resetAllPro() {
		return resetAll().finally(() => {
			ruleForm.value = structuredClone(toRaw(defaultForm));
		});
	}

	return {
		ruleForm,
		rules: rules as FormRules<RuleForm>,
		registerValidator: registerValidatorWithCleanup,
		registerResetter: registerResetterWithCleanup,
		validateAll,
		resetAll: resetAllPro
	};
}
