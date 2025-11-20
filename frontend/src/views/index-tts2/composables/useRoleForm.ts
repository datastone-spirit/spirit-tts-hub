/*
 * @Author: mulingyuer
 * @Date: 2025-11-20 15:31:11
 * @LastEditTime: 2025-11-20 15:45:52
 * @LastEditors: mulingyuer
 * @Description: 角色表单逻辑
 * @FilePath: \frontend\src\views\index-tts2\composables\useRoleForm.ts
 * 怎么可能会有bug！！！
 */
import { generateUUID } from "@/utils/tools";
import type { RuleForm, RoleItem } from "../types";
import { useSettingsStore } from "@/stores";

export function useRoleForm() {
	const settingsStore = useSettingsStore();

	/** 生成角色数据 */
	const generateRoleData = (ruleForm: RuleForm): string => {
		const item: RoleItem = {
			id: generateUUID(),
			isExpert: settingsStore.isExpert,
			createTime: Date.now(),
			...structuredClone(toRaw(ruleForm))
		};

		return JSON.stringify(item);
	};

	return {
		generateRoleData
	};
}
