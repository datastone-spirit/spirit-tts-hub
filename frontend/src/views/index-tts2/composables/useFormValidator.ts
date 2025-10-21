/*
 * @Author: mulingyuer
 * @Date: 2025-10-20 15:52:11
 * @LastEditTime: 2025-10-21 17:01:12
 * @LastEditors: mulingyuer
 * @Description: 表单逻辑
 * @FilePath: \frontend\src\views\index-tts2\composables\useFormValidator.ts
 * 怎么可能会有bug！！！
 */
import type { FormInstance, FormRules, FormValidateFailure } from "element-plus";
import type { RuleForm } from "../types";
import { useEnhancedStorage } from "@/hooks/useEnhancedStorage";
import { joinPrefixKey } from "@/utils/tools";

export type ValidateResult = { isValid: boolean; invalidFields?: FormValidateFailure["fields"] };
export type ValidateFunction = () => Promise<ValidateResult>;
export type UnregisterFunction = () => void;
export type ResetFunction = () => void;
export type ValidateAllOptions = { showMessage?: boolean };

const { useEnhancedLocalStorage } = useEnhancedStorage();
/** 存储所有子组件的 validate 函数 */
const validators: Array<ValidateFunction> = [];
/** 存储重置函数 */
const resetters: Array<ResetFunction> = [];

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

/** 将element-plus的表单校验转换成promise形式 */
const validateForm = (form: FormInstance): Promise<ValidateResult> => {
	return new Promise((resolve) => {
		if (!form) return resolve({ isValid: false });
		form.validate((isValid, invalidFields) => resolve({ isValid, invalidFields }));
	});
};

/** 注册一个子表单的校验函数 */
const registerValidator = (validateFn: ValidateFunction): UnregisterFunction => {
	validators.push(validateFn);
	// 返回注销函数（用于组件卸载时清理）
	return () => {
		const index = validators.indexOf(validateFn);
		if (index > -1) {
			validators.splice(index, 1);
		}
	};
};

/** 取消注册子表单的校验函数 */
const unregisterValidator = (validateFn: ValidateFunction) => {
	const index = validators.indexOf(validateFn);
	if (index > -1) validators.splice(index, 1);
};

/**
 * 全局校验：触发所有子表单的 validate
 * @returns Promise<boolean> 全部通过返回 true，否则 false
 */
const validateAll = async (
	options: ValidateAllOptions = {}
): Promise<{ isValid: boolean; message?: string }> => {
	if (validators.length === 0) {
		return { isValid: true };
	}

	const { showMessage = true } = options;

	try {
		const results = await Promise.all(
			validators.map((fn) => {
				return fn()
					.then((result) => {
						// 如果校验成功，返回成功状态
						if (result.isValid) {
							return { isValid: true };
						}

						// 如果校验失败，从 invalidFields 中提取错误信息
						let message = "";
						if (result.invalidFields) {
							let itemMessage = "";
							const FieldErrors = Object.values(result.invalidFields);
							FieldErrors.forEach((field) => {
								itemMessage += `${field.map((item) => item.message).join("\n")}\n`;
							});

							message += `${itemMessage}`;
						} else {
							message = "校验失败";
						}

						return { isValid: false, message };
					})
					.catch((error) => {
						// 处理校验函数执行过程中的异常
						const message = error?.message ?? "校验发生了异常错误";
						return { isValid: false, message };
					});
			})
		);

		// 没有全部通过
		const noValidList = results.filter((item) => !item.isValid);
		if (noValidList.length > 0) {
			let message = "";
			noValidList.forEach((item) => {
				message += item.message;
			});

			showMessage &&
				ElMessage.error({
					message,
					customClass: "break-line-message",
					duration: message.split("\n").length >= 2 ? 6000 : 3000,
					showClose: true
				});
			return { isValid: false, message };
		}

		// 全部通过
		return { isValid: true };
	} catch (error) {
		const message = (error as Error)?.message ?? "全局校验发生未知错误";

		showMessage && ElMessage.error({ message, showClose: true });
		return { isValid: false, message };
	}
};

/** 注册重置器 */
const registerResetter = (resetFn: ResetFunction): UnregisterFunction => {
	resetters.push(resetFn);
	return () => {
		const index = resetters.indexOf(resetFn);
		if (index > -1) resetters.splice(index, 1);
	};
};

/** 取消注册的子表单重置函数 */
const unregisterResetter = (resetFn: ResetFunction) => {
	const index = resetters.indexOf(resetFn);
	if (index > -1) resetters.splice(index, 1);
};

/** 全局重置 */
const resetAll = () => {
	// 重置所有子表单（如 ElForm 的 resetFields）
	resetters.forEach((fn) => fn());
	// 重置表单数据
	ruleForm.value = structuredClone(toRaw(defaultForm));
};

export function useFormValidator() {
	/** 支持自动清理的校验函数 */
	const registerValidatorWithCleanup = (validateFn: ValidateFunction) => {
		const unregister = registerValidator(validateFn);

		/** 自动注销 */
		onUnmounted(unregister);
	};

	/** 支持自动清理的重置函数 */
	const registerResetterWithCleanup = (resetFn: ResetFunction) => {
		const unregister = registerResetter(resetFn);
		onUnmounted(unregister);
	};

	return {
		ruleForm,
		rules: rules as FormRules<RuleForm>,
		validateForm,
		/** 支持自动清理，不需要手动注销 */
		registerValidator: registerValidatorWithCleanup,
		/** 支持自动清理，不需要手动注销 */
		registerResetter: registerResetterWithCleanup,
		unregisterValidator,
		unregisterResetter,
		validateAll,
		resetAll
	};
}
