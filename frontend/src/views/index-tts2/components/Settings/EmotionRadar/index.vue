<!--
 * @Author: mulingyuer
 * @Date: 2025-10-17 09:13:42
 * @LastEditTime: 2025-10-17 16:08:19
 * @LastEditors: mulingyuer
 * @Description: 情绪雷达图
 * @FilePath: \frontend\src\views\index-tts2\components\Settings\EmotionRadar2\index.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="emotion-radar-wrapper">
		<div class="emotion-radar-content">
			<div class="emotion-radar">
				<canvas ref="canvasRef"></canvas>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import Chart, { type ChartConfiguration } from "chart.js/auto";
import { useAppStore } from "@/stores";
import type { Emotion } from "./types";
import { THEME } from "./theme";

const emotion = defineModel({ type: Object as PropType<Emotion>, required: true });

const appStore = useAppStore();
const canvasRef = useTemplateRef("canvasRef");
let chartInstance: Chart | undefined = void 0;
// 情绪指标名称
const labels = [
	{
		name: "快乐",
		value: "happy"
	},
	{
		name: "生气",
		value: "angry"
	},
	{
		name: "难过",
		value: "sad"
	},
	{
		name: "害怕",
		value: "afraid"
	},
	{
		name: "厌恶",
		value: "disgusted"
	},
	{
		name: "忧郁",
		value: "melancholic"
	},
	{
		name: "惊讶",
		value: "surprised"
	},
	{
		name: "平静",
		value: "calm"
	}
] as const;
// 拖拽状态
const isDragging = ref(false);
const dragIndex = ref(-1);

/** 生成雷达图数据 */
const generateChartConfig = (): ChartConfiguration => {
	const theme = appStore.isDark ? THEME.dark : THEME.light;

	const config: ChartConfiguration = {
		type: "radar",
		data: {
			labels: labels.map((item) => item.name),
			datasets: [
				{
					label: "权重",
					data: labels.map((item) => emotion.value[item.value]),
					fill: true,
					backgroundColor: theme.backgroundColor,
					borderColor: theme.borderColor,
					pointBackgroundColor: theme.pointBackgroundColor,
					pointBorderColor: theme.pointBorderColor,
					pointHoverBackgroundColor: theme.pointHoverBackgroundColor,
					pointHoverBorderColor: theme.pointHoverBorderColor,
					pointRadius: 6,
					pointHoverRadius: 8
				}
			]
		},
		options: {
			scales: {
				r: {
					angleLines: { display: true, color: theme.lineColor },
					suggestedMin: 0,
					suggestedMax: 1,
					grid: { circular: false, color: theme.lineColor },
					ticks: { display: false, stepSize: 0.2 },
					pointLabels: {
						font: { size: 14 },
						color: theme.nameColor
					}
				}
			},
			plugins: {
				legend: { display: false },
				tooltip: {
					displayColors: false,
					backgroundColor: theme.tooltipBgColor,
					bodyColor: theme.tooltipTextColor,
					callbacks: {
						title: () => "", // 不显示标题
						label: (context) => {
							const value = context.parsed;
							return `${context.label}：${value.r}（可拖拽）`;
						}
					}
				}
			},
			animation: false // 禁用动画以获得更流畅的拖拽体验
		}
	};

	return config;
};

// 初始化图表
const initChart = () => {
	if (!canvasRef.value) return;
	const ctx = canvasRef.value.getContext("2d");
	if (ctx) {
		if (chartInstance) {
			chartInstance.destroy();
		}
		chartInstance = new Chart(ctx, generateChartConfig());
	}
};

// 更新图表数据
const updateChart = () => {
	if (chartInstance) {
		const newConfig = generateChartConfig();
		chartInstance.data = newConfig.data;
		chartInstance.options = newConfig.options!;
		chartInstance.update("none"); // 禁用动画以获得更流畅的拖拽体验
	}
};

/** 鼠标按下事件处理 */
const handleMouseDown = (event: MouseEvent) => {
	if (!chartInstance) return;

	const points = chartInstance.getDatasetMeta(0).data;
	const rect = chartInstance.canvas.getBoundingClientRect();
	const mouseX = event.clientX - rect.left;
	const mouseY = event.clientY - rect.top;

	for (let i = 0; i < points.length; i++) {
		const point = points[i] as unknown as { x: number; y: number };
		const dist = Math.hypot(mouseX - point.x, mouseY - point.y);
		if (dist < 12) {
			isDragging.value = true;
			dragIndex.value = i;
			break;
		}
	}
};

/** 鼠标移动事件处理 */
const handleMouseMove = (e: MouseEvent) => {
	if (!isDragging.value || dragIndex.value === -1 || !chartInstance) return;

	const rect = chartInstance.canvas.getBoundingClientRect();
	const mouseX = e.clientX - rect.left;
	const mouseY = e.clientY - rect.top;
	const activeLabel = labels[dragIndex.value]!;

	// 获取该点对应的角度
	const angle = (dragIndex.value / labels.length) * 2 * Math.PI - Math.PI / 2;

	// 计算到中心的距离（投影到该轴）
	const centerX =
		chartInstance.chartArea.left +
		(chartInstance.chartArea.right - chartInstance.chartArea.left) / 2;
	const centerY =
		chartInstance.chartArea.top +
		(chartInstance.chartArea.bottom - chartInstance.chartArea.top) / 2;

	const dx = mouseX - centerX;
	const dy = mouseY - centerY;
	const proj = dx * Math.cos(angle) + dy * Math.sin(angle); // 点积

	// 映射到 0~1
	const maxRadius =
		(Math.min(chartInstance.chartArea.width, chartInstance.chartArea.height) / 2) * 0.9;
	// 保留2位小数，四舍五入
	let value = Math.round((proj / maxRadius) * 100) / 100;
	value = Math.max(0, Math.min(1, value)); // 限制在0-1范围内

	emotion.value[activeLabel.value] = value;
	updateChart();
};

/** 鼠标松开事件处理 */
const handleMouseUp = () => {
	isDragging.value = false;
	dragIndex.value = -1;
};

/** 监听主题 */
watch(
	() => appStore.isDark,
	() => {
		if (chartInstance) {
			updateChart();
		}
	}
);

// 组件挂载后初始化
onMounted(() => {
	initChart();

	// 添加鼠标事件监听
	if (canvasRef.value) {
		canvasRef.value.addEventListener("mousedown", handleMouseDown);
		canvasRef.value.addEventListener("mousemove", handleMouseMove);
	}
	document.addEventListener("mouseup", handleMouseUp);
});

// 组件卸载前清理
onBeforeUnmount(() => {
	// 移除鼠标事件监听
	if (canvasRef.value) {
		canvasRef.value.removeEventListener("mousedown", handleMouseDown);
		canvasRef.value.removeEventListener("mousemove", handleMouseMove);
	}
	document.removeEventListener("mouseup", handleMouseUp);

	if (chartInstance) {
		chartInstance.destroy();
	}
});
</script>

<style lang="scss" scoped>
.emotion-radar-wrapper {
	width: 100%;
	text-align: center;
	margin-bottom: $zl-padding * 2;
}
.emotion-radar-content {
	display: inline-block;
	vertical-align: top;
	width: 70%;
	position: relative;
	z-index: 1;
	&::before {
		content: "";
		display: block;
		padding-top: 100%;
		opacity: 0;
		z-index: -1;
	}
}
.emotion-radar {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
}
</style>
