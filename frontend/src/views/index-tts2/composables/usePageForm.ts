/*
 * @Author: mulingyuer
 * @Date: 2025-10-20 15:52:11
 * @LastEditTime: 2025-11-07 12:53:34
 * @LastEditors: mulingyuer
 * @Description: 表单逻辑
 * @FilePath: \frontend\src\views\index-tts2\composables\usePageForm.ts
 * 怎么可能会有bug！！！
 */
import { useEnhancedStorage } from "@/hooks/useEnhancedStorage";
import { useFormValidator } from "@/hooks/useFormValidator";
import { generateUUID, joinPrefixKey } from "@/utils/tools";
import type { FormRules } from "element-plus";
import type { HistoryItem, RuleForm } from "../types";
import { EMO_CONTROL_METHOD, type TextToSpeechData } from "@/api/index-tts2";
import { useSettingsStore } from "@/stores";

const { useEnhancedLocalStorage } = useEnhancedStorage();
const { registerResetterWithCleanup, registerValidatorWithCleanup, validateAll, resetAll } =
	useFormValidator();

/** 表单数据 */
const defaultForm = readonly<RuleForm>({
	do_sample: true,
	emo_control_method: EMO_CONTROL_METHOD.SAME_AS_VOICE,
	emo_random: false,
	emo_ref_path: "",
	emo_weight: 0.8,
	length_penalty: 0,
	max_mel_tokens: 1500,
	max_text_tokens_per_segment: 120,
	num_beams: 3,
	prompt: "",
	repetition_penalty: 10,
	spk_audio_prompt: "",
	temperature: 0.8,
	text: "",
	top_k: 30,
	top_p: 0.8,
	vec1: 0,
	vec2: 0,
	vec3: 0,
	vec4: 0,
	vec5: 0,
	vec6: 0,
	vec7: 0,
	vec8: 0
});
const ruleForm = useEnhancedLocalStorage<RuleForm>({
	localKey: joinPrefixKey("index-tts2"),
	version: "1.0.0",
	defaultValue: structuredClone(toRaw(defaultForm)),
	blacklist: ["emo_ref_path", "spk_audio_prompt"]
});

/** 表单校验规则 */
const rules = reactive<FormRules<RuleForm>>({
	spk_audio_prompt: [
		{
			trigger: "change",
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
	emo_ref_path: [
		{
			trigger: "change",
			validator: (_rule, value, callback) => {
				const useEmotionAudio =
					ruleForm.value.emo_control_method === EMO_CONTROL_METHOD.USE_EMOTION_AUDIO;
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
	const settingsStore = useSettingsStore();

	/** 重置表单成功后重置表单数据
	 * 由于 ElForm 的 resetFields 方法只能重置被双向绑定的表单数据，未绑定的无法重置
	 * 所以这里手动复写表单数据
	 */
	function resetAllPro() {
		ruleForm.value = structuredClone(toRaw(defaultForm));
		return resetAll();
	}

	/** 生成历史数据 */
	function generateHistoryData(ruleForm: RuleForm): string {
		try {
			const item: HistoryItem = {
				id: generateUUID(),
				isExpert: settingsStore.isExpert,
				createTime: Date.now(),
				...structuredClone(toRaw(ruleForm))
			};

			return JSON.stringify(item);
		} catch (error) {
			console.error("生成历史数据失败", error);
			return "";
		}
	}

	/** 格式化表单数据 */
	const formatFormData = (ruleForm: RuleForm) => {
		const data: TextToSpeechData = {
			do_sample: ruleForm.do_sample,
			emo_control_method: ruleForm.emo_control_method,
			emo_random: ruleForm.emo_random,
			emo_ref_path: ruleForm.emo_ref_path,
			emo_weight: ruleForm.emo_weight,
			length_penalty: ruleForm.length_penalty,
			max_mel_tokens: ruleForm.max_mel_tokens,
			max_text_tokens_per_segment: ruleForm.max_text_tokens_per_segment,
			num_beams: ruleForm.num_beams,
			prompt: ruleForm.prompt,
			repetition_penalty: ruleForm.repetition_penalty,
			spk_audio_prompt: ruleForm.spk_audio_prompt,
			temperature: ruleForm.temperature,
			text: ruleForm.text,
			top_k: ruleForm.top_k,
			top_p: ruleForm.top_p,
			vec1: ruleForm.vec1,
			vec2: ruleForm.vec2,
			vec3: ruleForm.vec3,
			vec4: ruleForm.vec4,
			vec5: ruleForm.vec5,
			vec6: ruleForm.vec6,
			vec7: ruleForm.vec7,
			vec8: ruleForm.vec8,
			raw_data: generateHistoryData(ruleForm),
			output_path: settingsStore.appSettings.output_path
		};

		return data;
	};

	return {
		ruleForm,
		rules: rules as FormRules<RuleForm>,
		registerValidator: registerValidatorWithCleanup,
		registerResetter: registerResetterWithCleanup,
		validateAll,
		resetAll: resetAllPro,
		formatFormData
	};
}
