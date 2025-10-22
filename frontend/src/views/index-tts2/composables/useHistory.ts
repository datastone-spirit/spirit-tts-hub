/*
 * @Author: mulingyuer
 * @Date: 2025-10-22 16:15:24
 * @LastEditTime: 2025-10-22 16:27:27
 * @LastEditors: mulingyuer
 * @Description: 历史记录
 * @FilePath: \frontend\src\views\index-tts2\composables\useHistory.ts
 * 怎么可能会有bug！！！
 */
import { generateUUID, joinPrefixKey } from "@/utils/tools";
import type { HistoryData, RuleForm, HistoryItem } from "../types";
import { useEnhancedStorage } from "@/hooks/useEnhancedStorage";
import { useSettingsStore } from "@/stores";

const { useEnhancedLocalStorage } = useEnhancedStorage();

/** 历史记录 */
const historyData = useEnhancedLocalStorage<HistoryData>({
	localKey: joinPrefixKey("index-tts2-history"),
	version: "1.0.0",
	defaultValue: []
});

export function useHistory() {
	const settingsStore = useSettingsStore();

	/** 添加记录 */
	const addHistory = (item: RuleForm) => {
		const data: HistoryItem = {
			id: generateUUID(),
			isExpert: settingsStore.isExpert,
			createTime: Date.now(),
			...structuredClone(toRaw(item))
		};

		historyData.value.unshift(data); // 添加到最前面
	};

	/** 删除指定记录 */
	const deleteHistory = (id: string) => {
		historyData.value = historyData.value.filter((item) => item.id !== id);
	};

	/** 清空所有记录 */
	const clearHistory = () => {
		historyData.value = [];
	};

	return {
		historyData,
		addHistory,
		deleteHistory,
		clearHistory
	};
}
