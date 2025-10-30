/*
 * @Author: mulingyuer
 * @Date: 2024-12-04 16:14:16
 * @LastEditTime: 2025-10-30 16:46:14
 * @LastEditors: mulingyuer
 * @Description: 设置数据仓库
 * @FilePath: \frontend\src\stores\modules\settings\index.ts
 * 怎么可能会有bug！！！
 */
import { defineStore } from "pinia";
import { ComplexityEnum } from "@/enums/complexity.enum";
import { getEnv } from "@/utils/env";
import type { AppSettings } from "./types";
export type * from "./types";
import { resettableRef } from "@/utils/ref";

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
		const whiteCheck = readonly(computed(() => getEnv().VITE_APP_WHITE_CHECK === "true"));

		/** 应用设置 */
		const [appSettings, restoreAppSettings] = resettableRef<AppSettings>({
			uploadPath: whiteCheck.value ? `${getEnv().VITE_APP_OUTPUT_PARENT_PATH}` : "",
			outputPath: whiteCheck.value ? `${getEnv().VITE_APP_OUTPUT_PARENT_PATH}` : ""
		});
		function resetAppSettings() {
			restoreAppSettings();
		}

		return {
			complexity,
			setComplexity,
			isBeginner,
			isExpert,
			whiteCheck,
			appSettings,
			resetAppSettings
		};
	},
	{
		persist: true
	}
);

export type UseSettingsStore = ReturnType<typeof useSettingsStore>;
