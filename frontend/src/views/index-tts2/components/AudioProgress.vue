<!--
 * @Author: mulingyuer
 * @Date: 2025-09-26 11:58:11
 * @LastEditTime: 2025-09-26 15:34:22
 * @LastEditors: mulingyuer
 * @Description: 音频进度条
 * @FilePath: \frontend\src\views\index-tts2\components\AudioProgress.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="audio-progress">
		<div
			ref="containerRef"
			class="audio-progress-bar-container"
			:class="{ 'is-dragging': isDragging }"
			@click="onHandleBarClick"
		>
			<div class="audio-progress-bar" :style="{ width: `${progressValue}%` }"></div>
			<div
				class="audio-progress-handle"
				:style="{ left: `${progressValue}%` }"
				@mousedown.stop="onHandleMouseDown"
			></div>
		</div>
	</div>
</template>

<script setup lang="ts">
const progress = defineModel({ type: Number, required: true });
const emit = defineEmits<{
	change: [value: number];
}>();
const containerRef = useTemplateRef("containerRef");
const isDragging = ref(false);
/** 组件内部使用的进度值 */
const progressValue = computed({
	get: () => progress.value,
	set: (val) => {
		// 确保值在 0 到 100 之间
		const clampedValue = Math.max(0, Math.min(100, val));
		progress.value = clampedValue;
	}
});

/**
 * 将鼠标 X 坐标转换为 0-100 的百分比进度
 * @param clientX 鼠标事件的 clientX 坐标
 */
function calculateProgressFromX(clientX: number): number {
	if (!containerRef.value) return 0;

	const barRect = containerRef.value.getBoundingClientRect();
	// 鼠标在进度条内的相对位置
	const relativeX = clientX - barRect.left;
	// 转换为百分比
	const percentage = (relativeX / barRect.width) * 100;
	// 确保百分比在 0 到 100 之间
	return Math.max(0, Math.min(100, percentage));
}

// 拖拽逻辑
function onHandleMouseDown(event: MouseEvent) {
	event.preventDefault();
	isDragging.value = true;
	// 启动拖拽时，监听全局事件
	document.addEventListener("mousemove", onHandleMouseMove);
	document.addEventListener("mouseup", onHandleMouseUp);
}
function onHandleMouseMove(event: MouseEvent) {
	if (!isDragging.value) return;

	const newProgress = calculateProgressFromX(event.clientX);
	progressValue.value = newProgress;
}
function onHandleMouseUp() {
	if (!isDragging.value) return;

	isDragging.value = false;
	// 拖拽结束时，移除全局事件监听
	document.removeEventListener("mousemove", onHandleMouseMove);
	document.removeEventListener("mouseup", onHandleMouseUp);

	// 触发调整结束事件
	emit("change", progressValue.value);
}

// 点击逻辑
function onHandleBarClick(event: MouseEvent) {
	// 如果是拖拽过程中的mouseup触发的点击，则忽略
	if (isDragging.value) return;

	const newProgress = calculateProgressFromX(event.clientX);
	progressValue.value = newProgress;

	// 立即触发调整结束事件
	emit("change", newProgress);
}

// 确保在组件销毁时移除残留的全局监听器
onUnmounted(() => {
	document.removeEventListener("mousemove", onHandleMouseMove);
	document.removeEventListener("mouseup", onHandleMouseUp);
});
</script>

<style lang="scss" scoped>
.audio-progress {
	width: 100%;
}
.audio-progress-bar-container {
	position: relative;
	width: 100%;
	height: 6px;
	background-color: var(--el-border-color-light);
	border-radius: 999px;
	cursor: pointer;
	@include no-select();
}
.audio-progress-bar {
	position: absolute;
	height: 100%;
	background-color: var(--el-color-primary);
	border-radius: 999px;
	// transition: width 0.1s ease;
}
.audio-progress-bar-container.is-dragging {
	.audio-progress-bar {
		transition: none;
	}
}
.audio-progress-handle {
	position: absolute;
	top: 50%;
	transform: translate(-50%, -50%);
	width: 16px;
	height: 16px;
	background-color: var(--el-color-white);
	border: 2px solid var(--el-color-primary);
	border-radius: 50%;
	cursor: grab;
	transition:
		transform 0.2s,
		width 0.2s,
		height 0.2s;
	box-shadow: var(--el-box-shadow);
}
.audio-progress-bar-container.is-dragging .audio-progress-handle,
.audio-progress-handle:hover {
	width: 20px;
	height: 20px;
	border-color: var(--el-color-primary-dark-2);
	cursor: grabbing;
}
</style>
