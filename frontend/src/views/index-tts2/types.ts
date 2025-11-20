/*
 * @Author: mulingyuer
 * @Date: 2025-10-16 11:40:33
 * @LastEditTime: 2025-11-20 09:38:05
 * @LastEditors: mulingyuer
 * @Description: index tts2 类型
 * @FilePath: \frontend\src\views\index-tts2\types.ts
 * 怎么可能会有bug！！！
 */
import type { TextToSpeechData, TTSHistoryResult } from "@/api/index-tts2";
import type { Simplify } from "type-fest";

/** 表单 */
export type RuleForm = Omit<TextToSpeechData, "raw_data" | "output_path">;

/** 示例数据 */
export interface ExampleItem extends RuleForm {
	/** 专家模式 */
	isExpert: boolean;
}
export type ExampleData = ExampleItem[];

/** 生成的历史数据 */
export interface HistoryItem extends RuleForm {
	id: string;
	/** 专家模式 */
	isExpert: boolean;
	/** 创建事件 ms */
	createTime: number;
}

/** 后端返回的历史数据 */
export type TTSHistoryItem = Simplify<
	Omit<TTSHistoryResult["records"][number], "input_config_raw"> & { input_config_raw: HistoryItem }
>;
export type HistoryData = Array<TTSHistoryItem>;
