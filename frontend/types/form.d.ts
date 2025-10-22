/*
 * @Author: mulingyuer
 * @Date: 2025-10-22 09:43:31
 * @LastEditTime: 2025-10-22 09:44:52
 * @LastEditors: mulingyuer
 * @Description: 表单相关全局类型
 * @FilePath: \frontend\types\form.d.ts
 * 怎么可能会有bug！！！
 */
import type { FormValidateFailure } from "element-plus";

declare global {
	interface FormValidateResult {
		isValid: boolean;
		invalidFields?: FormValidateFailure["fields"];
	}
}

export {};
