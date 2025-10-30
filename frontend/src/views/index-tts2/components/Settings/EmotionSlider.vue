<!--
 * @Author: mulingyuer
 * @Date: 2025-10-17 16:24:14
 * @LastEditTime: 2025-10-29 17:03:32
 * @LastEditors: mulingyuer
 * @Description: 情绪权重滑块组件
 * @FilePath: \frontend\src\views\index-tts2\components\Settings\EmotionSlider.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="emotion-slider">
		<el-form-item class="emotion-strengths-item" label="快乐" prop="vec1" label-position="left">
			<NumericRangeControl
				v-model="ruleForm.vec1"
				:min="0"
				:max="1"
				:step="0.01"
				size="small"
				:show-reset-text="false"
				:reset-default="0"
				@change="$emit('change', 'vec1', $event)"
			/>
		</el-form-item>
		<el-form-item class="emotion-strengths-item" label="生气" prop="vec2" label-position="left">
			<NumericRangeControl
				v-model="ruleForm.vec2"
				:min="0"
				:max="1"
				:step="0.01"
				size="small"
				:show-reset-text="false"
				:reset-default="0"
				@change="$emit('change', 'vec2', $event)"
			/>
		</el-form-item>
		<el-form-item class="emotion-strengths-item" label="难过" prop="vec3" label-position="left">
			<NumericRangeControl
				v-model="ruleForm.vec3"
				:min="0"
				:max="1"
				:step="0.01"
				size="small"
				:show-reset-text="false"
				:reset-default="0"
				@change="$emit('change', 'vec3', $event)"
			/>
		</el-form-item>
		<el-form-item class="emotion-strengths-item" label="害怕" prop="vec4" label-position="left">
			<NumericRangeControl
				v-model="ruleForm.vec4"
				:min="0"
				:max="1"
				:step="0.01"
				size="small"
				:show-reset-text="false"
				:reset-default="0"
				@change="$emit('change', 'vec4', $event)"
			/>
		</el-form-item>
		<el-form-item class="emotion-strengths-item" label="厌恶" prop="vec5" label-position="left">
			<NumericRangeControl
				v-model="ruleForm.vec5"
				:min="0"
				:max="1"
				:step="0.01"
				size="small"
				:show-reset-text="false"
				:reset-default="0"
				@change="$emit('change', 'vec5', $event)"
			/>
		</el-form-item>
		<el-form-item class="emotion-strengths-item" label="忧郁" prop="vec6" label-position="left">
			<NumericRangeControl
				v-model="ruleForm.vec6"
				:min="0"
				:max="1"
				:step="0.01"
				size="small"
				:show-reset-text="false"
				:reset-default="0"
				@change="$emit('change', 'vec6', $event)"
			/>
		</el-form-item>
		<el-form-item class="emotion-strengths-item" label="惊讶" prop="vec7" label-position="left">
			<NumericRangeControl
				v-model="ruleForm.vec7"
				:min="0"
				:max="1"
				:step="0.01"
				size="small"
				:show-reset-text="false"
				:reset-default="0"
				@change="$emit('change', 'vec7', $event)"
			/>
		</el-form-item>
		<el-form-item class="emotion-strengths-item" label="平静" prop="vec8" label-position="left">
			<NumericRangeControl
				v-model="ruleForm.vec8"
				:min="0"
				:max="1"
				:step="0.01"
				size="small"
				:show-reset-text="false"
				:reset-default="0"
				@change="$emit('change', 'vec8', $event)"
			/>
		</el-form-item>
	</div>
</template>

<script setup lang="ts">
import type { RuleForm } from "../../types";

const ruleForm = defineModel({ type: Object as PropType<RuleForm>, required: true });
const _emit = defineEmits<{
	/** 数值变动 */
	change: [key: keyof RuleForm, value: number];
}>();
</script>

<style lang="scss" scoped>
.emotion-slider {
	width: 100%;
}
.emotion-strengths-item {
	& + & {
		margin-top: 6px;
	}
	:deep(.el-form-item__label) {
		margin-bottom: 0;
		font-size: 16px;
		line-height: 40px;
	}
}
</style>
