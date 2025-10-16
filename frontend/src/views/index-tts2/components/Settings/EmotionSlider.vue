<!--
 * @Author: mulingyuer
 * @Date: 2025-10-16 16:25:54
 * @LastEditTime: 2025-10-16 17:18:05
 * @LastEditors: mulingyuer
 * @Description: 情绪权重滑块
 * @FilePath: \frontend\src\views\index-tts2\components\Settings\EmotionSlider.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="emotion-slider">
		<div class="emotion-slider-left">
			<el-slider
				class="value-slider"
				v-model="modelValue"
				:min="min"
				:max="max"
				:disabled="disabled"
				:size="size"
				:step="step"
				@change="onSliderChange"
			/>
		</div>
		<div class="emotion-slider-right">
			<el-button
				class="emotion-slider-reset-button"
				:disabled="disabled"
				:size="size"
				:icon="RiResetLeftLine"
				circle
				@click="onResetTokenCount"
			>
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";
import type { ComponentSize } from "element-plus";

export interface EmotionSliderProps {
	/** 设置计数器允许的最小值 */
	min?: number;
	/** 设置计数器允许的最大值 */
	max?: number;
	/** 是否禁用 */
	disabled?: boolean;
	/** 大小 */
	size?: ComponentSize;
	/** 计数器步长 */
	step?: number;
	/** 是否只能输入 step 的倍数 */
	stepStrictly?: boolean;
	/** 重置的默认值 */
	resetDefault?: number;
}

const modelValue = defineModel({ type: Number, required: true });
const props = withDefaults(defineProps<EmotionSliderProps>(), {
	min: 0,
	max: 1,
	disabled: false,
	size: "small",
	step: 0.01,
	stepStrictly: false
});
const emit = defineEmits<{
	/** 滑块值改变 */
	"slider-change": [value: number];
	/** 重置令牌数 */
	"reset-token-count": [];
}>();

// icon
const RiResetLeftLine = useIcon({ name: "ri-reset-left-line", size: 14 });

/** 初始值 */
const initialTokenCount = props.resetDefault ?? modelValue.value;

/** 滑块值改变 */
function onSliderChange(value: number | number[]) {
	emit("slider-change", value as number);
}
/** 重置令牌数 */
function onResetTokenCount() {
	modelValue.value = initialTokenCount;
	emit("reset-token-count");
}
</script>

<style lang="scss" scoped>
.emotion-slider {
	width: 100%;
	display: flex;
	align-items: center;
	gap: $zl-padding;
}
.emotion-slider-left {
	flex-grow: 1;
	min-width: 0;
	display: flex;
	align-items: center;
}
.value-slider {
	--el-slider-height: 4px;
	--el-slider-button-size: 14px;
}
</style>
