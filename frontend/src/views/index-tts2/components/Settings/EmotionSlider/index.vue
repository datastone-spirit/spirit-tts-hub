<!--
 * @Author: mulingyuer
 * @Date: 2025-10-17 16:24:14
 * @LastEditTime: 2025-10-17 17:02:55
 * @LastEditors: mulingyuer
 * @Description: 情绪权重滑块组件
 * @FilePath: \frontend\src\views\index-tts2\components\Settings\EmotionSlider\index.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="emotion-slider">
		<el-form-item
			class="emotion-strengths-item"
			label="快乐"
			prop="emotionStrengths.happy"
			label-position="left"
		>
			<Slider
				v-model="emotion.happy"
				:reset-default="0"
				@change="$emit('change', 'happy', $event)"
			/>
		</el-form-item>
		<el-form-item
			class="emotion-strengths-item"
			label="生气"
			prop="emotionStrengths.angry"
			label-position="left"
		>
			<Slider
				v-model="emotion.angry"
				:reset-default="0"
				@change="$emit('change', 'angry', $event)"
			/>
		</el-form-item>
		<el-form-item
			class="emotion-strengths-item"
			label="难过"
			prop="emotionStrengths.sad"
			label-position="left"
		>
			<Slider v-model="emotion.sad" :reset-default="0" @change="$emit('change', 'sad', $event)" />
		</el-form-item>
		<el-form-item
			class="emotion-strengths-item"
			label="害怕"
			prop="emotionStrengths.afraid"
			label-position="left"
		>
			<Slider
				v-model="emotion.afraid"
				:reset-default="0"
				@change="$emit('change', 'afraid', $event)"
			/>
		</el-form-item>
		<el-form-item
			class="emotion-strengths-item"
			label="厌恶"
			prop="emotionStrengths.disgusted"
			label-position="left"
		>
			<Slider
				v-model="emotion.disgusted"
				:reset-default="0"
				@change="$emit('change', 'disgusted', $event)"
			/>
		</el-form-item>
		<el-form-item
			class="emotion-strengths-item"
			label="忧郁"
			prop="emotionStrengths.melancholic"
			label-position="left"
		>
			<Slider
				v-model="emotion.melancholic"
				:reset-default="0"
				@change="$emit('change', 'melancholic', $event)"
			/>
		</el-form-item>
		<el-form-item
			class="emotion-strengths-item"
			label="惊讶"
			prop="emotionStrengths.surprised"
			label-position="left"
		>
			<Slider
				v-model="emotion.surprised"
				:reset-default="0"
				@change="$emit('change', 'surprised', $event)"
			/>
		</el-form-item>
		<el-form-item
			class="emotion-strengths-item"
			label="平静"
			prop="emotionStrengths.calm"
			label-position="left"
		>
			<Slider v-model="emotion.calm" :reset-default="0" @change="$emit('change', 'calm', $event)" />
		</el-form-item>
	</div>
</template>

<script setup lang="ts">
import type { Emotion } from "../types";
import Slider from "./Slider.vue";

const emotion = defineModel({ type: Object as PropType<Emotion>, required: true });
const _emit = defineEmits<{
	/** 数值变动 */
	change: [key: keyof Emotion, value: number];
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
