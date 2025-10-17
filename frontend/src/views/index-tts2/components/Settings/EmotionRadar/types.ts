/*
 * @Author: mulingyuer
 * @Date: 2025-10-17 10:52:02
 * @LastEditTime: 2025-10-17 15:31:59
 * @LastEditors: mulingyuer
 * @Description: 情绪雷达图类型
 * @FilePath: \frontend\src\views\index-tts2\components\Settings\EmotionRadar2\types.ts
 * 怎么可能会有bug！！！
 */
import type { RuleForm } from "../../../types";

/** 情绪数据 */
export type Emotion = RuleForm["emotionStrengths"];

/** 主题颜色 */
export interface ThemeColor {
	/** 雷达区域背景色 */
	backgroundColor: string;
	/** 雷达边框颜色 */
	borderColor: string;
	/** 圆点背景色 */
	pointBackgroundColor: string;
	/** 圆点边框颜色 */
	pointBorderColor: string;
	/** 圆点悬停背景色 */
	pointHoverBackgroundColor: string;
	/** 圆点悬停边框颜色 */
	pointHoverBorderColor: string;
	/** 名称颜色 */
	nameColor: string;
	/** tooltip背景色 */
	tooltipBgColor: string;
	/** tooltip文本颜色 */
	tooltipTextColor: string;
	/** 线框颜色 */
	lineColor: string;
}
