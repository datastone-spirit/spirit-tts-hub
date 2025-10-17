/*
 * @Author: mulingyuer
 * @Date: 2025-10-17 10:52:52
 * @LastEditTime: 2025-10-17 17:00:48
 * @LastEditors: mulingyuer
 * @Description: 雷达图主题
 * @FilePath: \frontend\src\views\index-tts2\components\Settings\EmotionRadar\theme.ts
 * 怎么可能会有bug！！！
 */
import type { ThemeColor } from "../types";

/** 主题颜色 */
export const THEME: Record<"dark" | "light", ThemeColor> = {
	/** 浅色 */
	light: {
		backgroundColor: "rgba(32, 189, 160, 0.30)",
		borderColor: "#20bda0",
		pointBackgroundColor: "#20bda0",
		pointBorderColor: "#fff",
		pointHoverBackgroundColor: "#20bda0",
		pointHoverBorderColor: "#fff",
		nameColor: "#303133",
		tooltipBgColor: "#303133",
		tooltipTextColor: "#ffffff",
		lineColor: "#e4e7ed"
	},
	/** 深色 */
	dark: {
		backgroundColor: "rgba(32, 189, 160, 0.30)",
		borderColor: "#20bda0",
		pointBackgroundColor: "#20bda0",
		pointBorderColor: "#fff",
		pointHoverBackgroundColor: "#20bda0",
		pointHoverBorderColor: "#fff",
		nameColor: "#E5EAF3",
		tooltipBgColor: "#E5EAF3",
		tooltipTextColor: "#141414",
		lineColor: "#414243"
	}
};
