<!--
 * @Author: mulingyuer
 * @Date: 2025-10-16 15:42:45
 * @LastEditTime: 2025-10-16 17:18:20
 * @LastEditors: mulingyuer
 * @Description: 数值滑块组件
 * @FilePath: \frontend\src\components\Form\ValueSlider.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="value-slider-wrapper">
		<div class="value-slider-left">
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
		<div class="value-slider-right">
			<ElSpacePro :size="8">
				<el-input-number
					class="value-slider-input-number"
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
					class="value-slider-reset-button"
					:disabled="disabled"
					:size="size"
					@click="onResetTokenCount"
				>
					重置
				</el-button>
			</ElSpacePro>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ComponentSize } from "element-plus";

export interface ValueSliderProps {
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
const props = withDefaults(defineProps<ValueSliderProps>(), {
	min: Number.MIN_SAFE_INTEGER,
	max: Number.MAX_SAFE_INTEGER,
	disabled: false,
	size: "default",
	step: 1,
	stepStrictly: false
});
const emit = defineEmits<{
	/** 滑块值改变 */
	"slider-change": [value: number];
	/** 数字值改变 */
	"input-number-change": [value: number];
	/** 重置令牌数 */
	"reset-token-count": [];
}>();

/** 初始值 */
const initialTokenCount = props.resetDefault ?? modelValue.value;

/** 滑块值改变 */
function onSliderChange(value: number | number[]) {
	emit("slider-change", value as number);
}
/** 数字值改变 */
function onInputNumberChange(value: number | undefined) {
	emit("input-number-change", value as number);
}
/** 重置令牌数 */
function onResetTokenCount() {
	modelValue.value = initialTokenCount;
	emit("reset-token-count");
}
</script>

<style lang="scss" scoped>
.value-slider-wrapper {
	width: 100%;
	display: flex;
	align-items: center;
}
.value-slider-left {
	flex-grow: 1;
	min-width: 0;
	padding: 0 10px;
	display: flex;
	align-items: center;
}
.value-slider-right {
	flex-shrink: 0;
	margin-left: $zl-padding;
	display: flex;
	align-items: center;
}
.value-slider-input-number {
	width: 100px;
}
.value-slider-reset-button {
	background-color: var(--el-fill-color-light);
}
</style>
