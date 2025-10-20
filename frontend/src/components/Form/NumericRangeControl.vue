<!--
 * @Author: mulingyuer
 * @Date: 2025-10-20 11:27:57
 * @LastEditTime: 2025-10-20 14:39:20
 * @LastEditors: mulingyuer
 * @Description: 数字范围控制器
 * @FilePath: \frontend\src\components\Form\NumericRangeControl.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="numeric-range-control" :class="[size]">
		<div class="numeric-range-control-left">
			<el-slider
				class="slider"
				v-model="modelValue"
				:min="min"
				:max="max"
				:disabled="disabled"
				:size="size"
				:step="step"
				:show-tooltip="showTooltip"
				@change="onSliderChange"
			/>
		</div>
		<div class="numeric-range-control-right">
			<el-input-number
				class="number"
				v-model="modelValue"
				:min="min"
				:max="max"
				controls-position="right"
				:disabled="disabled"
				:size="size"
				:step="step"
				:step-strictly="stepStrictly"
				:precision="precision"
				@change="onInputNumberChange"
			/>
			<el-button
				class="reset-button"
				:class="{ 'hide-text': !showResetText, 'hide-icon': !showResetIcon }"
				:disabled="disabled"
				:size="size"
				:icon="showResetIcon ? RiResetLeftLine : void 0"
				@click="onResetTokenCount"
			>
				<template #default v-if="showResetText">
					{{ resetText }}
				</template>
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useIcon, type UseIconProps } from "@/hooks/useIcon";
import type { ComponentSize } from "element-plus";

export interface NumericRangeControlProps {
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
	/** 是否显示重置按钮icon */
	showResetIcon?: boolean;
	/** 重置按钮icon name */
	resetIconName?: UseIconProps["name"];
	/** 重置按钮icon size */
	resetIconSize?: UseIconProps["size"];
	/** 是否显示重置按钮文本 */
	showResetText?: boolean;
	/** 重置按钮文本 */
	resetText?: string;
	/** 是否显示滑块提示 */
	showTooltip?: boolean;
	/** 数值精度 */
	precision?: number;
}

const modelValue = defineModel({ type: Number, required: true });
const props = withDefaults(defineProps<NumericRangeControlProps>(), {
	min: Number.MIN_SAFE_INTEGER,
	max: Number.MAX_SAFE_INTEGER,
	disabled: false,
	size: "default",
	step: 1,
	stepStrictly: false,
	showResetButton: true,
	showResetIcon: true,
	resetIconName: "ri-reset-left-line",
	resetIconSize: 14,
	showResetText: true,
	resetText: "重置",
	showTooltip: true
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
const RiResetLeftLine = useIcon({ name: props.resetIconName, size: props.resetIconSize });

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
.numeric-range-control {
	&.default {
		--numeric-range-control-gap: 12px;
		--numeric-range-control-left-padding-inline: 10px;
		--numeric-range-control-right-gap: 8px;
		--number-width: 100px;
		--slider-height: 6px;
		--slider-button-size: 20px;
		--reset-button-hide-text-padding: 8px;
	}
	&.small {
		--numeric-range-control-gap: 8px;
		--numeric-range-control-left-padding-inline: 4px;
		--numeric-range-control-right-gap: 4px;
		--number-width: 75px;
		--slider-height: 4px;
		--slider-button-size: 16px;
		--reset-button-hide-text-padding: 5px;
	}
	&.large {
		--numeric-range-control-gap: 16px;
		--numeric-range-control-left-padding-inline: 12px;
		--numeric-range-control-right-gap: 10px;
		--number-width: 120px;
		--slider-height: 8px;
		--slider-button-size: 24px;
		--reset-button-hide-text-padding: 12px;
	}
}
.numeric-range-control {
	width: 100%;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: var(--numeric-range-control-gap);
}
.numeric-range-control-left {
	flex-grow: 1;
	min-width: 0px;
	padding-inline: var(--numeric-range-control-left-padding-inline);
}
.slider {
	--el-slider-height: var(--slider-height);
	--el-slider-button-size: var(--slider-button-size);
}
.numeric-range-control-right {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	gap: var(--numeric-range-control-right-gap);
}
.number {
	width: var(--number-width);
}
.reset-button {
	background-color: var(--el-fill-color-light);
	&.hide-text {
		padding: var(--reset-button-hide-text-padding);
	}
}
</style>
