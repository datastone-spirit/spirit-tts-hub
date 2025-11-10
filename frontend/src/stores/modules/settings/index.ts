/*
 * @Author: mulingyuer
 * @Date: 2024-12-04 16:14:16
 * @LastEditTime: 2025-11-10 14:55:13
 * @LastEditors: mulingyuer
 * @Description: 设置数据仓库
 * @FilePath: \frontend\src\stores\modules\settings\index.ts
 * 怎么可能会有bug！！！
 */
import type { ConfigResult } from "@/api/config";
import { ComplexityEnum } from "@/enums/complexity.enum";
import { getEnv } from "@/utils/env";
import { defineStore } from "pinia";
export type * from "./types";

export const useSettingsStore = defineStore(
	"settings",
	() => {
		/** 表单复杂度 */
		const complexity = ref<ComplexityEnum>(ComplexityEnum.BEGINNER);
		function setComplexity(value: ComplexityEnum) {
			complexity.value = value;
		}

		/** 是否新手难度 */
		const isBeginner = computed(() => complexity.value === ComplexityEnum.BEGINNER);
		/** 是否专家难度 */
		const isExpert = computed(() => complexity.value === ComplexityEnum.EXPERT);

		/** 是否开启小白校验 */
		const whiteCheck = computed(() => getEnv().VITE_APP_WHITE_CHECK === "true");

		/** 应用设置 */
		const appSettings = ref<ConfigResult>({
			history_path: "",
			output_path: "",
			upload_path: ""
		});
		function updateAppSettings(data: ConfigResult) {
			if (!data) return;
			appSettings.value = data;
		}

		return {
			complexity,
			setComplexity,
			isBeginner,
			isExpert,
			whiteCheck,
			appSettings,
			updateAppSettings
		};
	},
	{
		persist: true
	}
);

export type UseSettingsStore = ReturnType<typeof useSettingsStore>;
