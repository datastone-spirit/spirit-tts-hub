/*
 * @Author: mulingyuer
 * @Date: 2025-10-16 11:40:33
 * @LastEditTime: 2025-11-05 15:49:35
 * @LastEditors: mulingyuer
 * @Description: index tts2 类型
 * @FilePath: \frontend\src\views\index-tts2\types.ts
 * 怎么可能会有bug！！！
 */
import type { TextToSpeechData } from "@/api/index-tts2";

/** 表单 */
export type RuleForm = Omit<TextToSpeechData, "raw_data" | "output_path">;

/** 示例数据 */
export interface ExampleItem extends RuleForm {
	/** 专家模式 */
	isExpert: boolean;
}
export type ExampleData = ExampleItem[];

/** 历史数据 */
export interface HistoryItem extends RuleForm {
	id: string;
	/** 专家模式 */
	isExpert: boolean;
	/** 创建事件 ms */
	createTime: number;
}
export type HistoryData = HistoryItem[];
