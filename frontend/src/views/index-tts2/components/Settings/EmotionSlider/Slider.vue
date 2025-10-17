<!--
 * @Author: mulingyuer
 * @Date: 2025-10-16 16:25:54
 * @LastEditTime: 2025-10-17 16:51:51
 * @LastEditors: mulingyuer
 * @Description: 情绪权重滑块
 * @FilePath: \frontend\src\views\index-tts2\components\Settings\EmotionSlider\Slider.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="slider-wrapper">
		<div class="slider-left">
			<el-slider
				class="slider"
				v-model="modelValue"
				:min="min"
				:max="max"
				:disabled="disabled"
				:size="size"
				:step="step"
				@change="onSliderChange"
			/>
		</div>
		<div class="slider-right">
			<ElSpacePro :size="4">
				<el-input-number
					class="slider-input-number"
					v-model="modelValue"
					:min="min"
					:max="max"
					controls-position="right"
					:disabled="disabled"
					:size="size"
					:step="step"
					:step-strictly="stepStrictly"
					@change="onInputNumberChange"
				/>
				<el-button
					class="slider-reset-button"
					:disabled="disabled"
					:size="size"
					:icon="RiResetLeftLine"
					title="重置"
					@click="onResetTokenCount"
				>
				</el-button>
			</ElSpacePro>
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
	/** 数字值改变 */
	"input-number-change": [value: number];
	/** 重置令牌数 */
	"reset-token-count": [];
	/** 数值变动 */
	change: [value: number];
}>();

// icon
const RiResetLeftLine = useIcon({ name: "ri-reset-left-line", size: 14 });

/** 初始值 */
const initialTokenCount = props.resetDefault ?? modelValue.value;

/** 滑块值改变 */
function onSliderChange(value: number | number[]) {
	emit("slider-change", value as number);
	emit("change", value as number);
}
/** 数字值改变 */
function onInputNumberChange(value: number | undefined) {
	emit("input-number-change", value as number);
	emit("change", value as number);
}
/** 重置令牌数 */
function onResetTokenCount() {
	modelValue.value = initialTokenCount;
	emit("reset-token-count");
	emit("change", initialTokenCount);
}
</script>

<style lang="scss" scoped>
.slider-wrapper {
	width: 100%;
	display: flex;
	align-items: center;
	gap: $zl-padding;
	line-height: 1;
}
.slider-left {
	flex-grow: 1;
	min-width: 0;
}
.slider {
	--el-slider-height: 4px;
	--el-slider-button-size: 14px;
}
.slider-input-number {
	width: 75px;
}
.slider-reset-button {
	padding: 5px;
	background-color: var(--el-fill-color-light);
}
</style>
