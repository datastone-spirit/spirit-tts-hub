/*
 * @Author: mulingyuer
 * @Date: 2025-10-21 17:29:52
 * @LastEditTime: 2025-10-22 09:45:32
 * @LastEditors: mulingyuer
 * @Description: 表单验证
 * @FilePath: \frontend\src\hooks\useFormValidator.ts
 * 怎么可能会有bug！！！
 */
export type ValidateFunction = () => Promise<FormValidateResult>;
export type UnregisterFunction = () => void;
export type ResetFunction = () => void | Promise<void>;
export type ValidateAllOptions = { showMessage?: boolean };

export function useFormValidator() {
	/** 存储所有子组件的 validate 函数 */
	const validators: Array<ValidateFunction> = [];
	/** 存储重置函数 */
	const resetters: Array<ResetFunction> = [];

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
	const resetAll = async (): Promise<void> => {
		// 如果 resetters 中有异步函数（返回 Promise），这里会等待全部执行完成
		await Promise.all(
			resetters.map(async (fn) => {
				try {
					await fn(); // 兼容同步和异步 resetFn
				} catch (error) {
					console.warn("resetAll 函数执行出错：", error);
				}
			})
		);
	};

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
		registerValidator,
		unregisterValidator,
		validateAll,
		registerResetter,
		unregisterResetter,
		resetAll,
		registerValidatorWithCleanup,
		registerResetterWithCleanup
	};
}
