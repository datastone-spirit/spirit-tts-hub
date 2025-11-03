<!--
 * @Author: mulingyuer
 * @Date: 2025-10-16 15:12:15
 * @LastEditTime: 2025-11-03 14:15:22
 * @LastEditors: mulingyuer
 * @Description: 主体卡片
 * @FilePath: \frontend\src\views\index-tts2\components\BodyCard.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="body-card">
		<div class="body-card-head">
			<div class="body-card-title">
				<Icon class="body-card-icon" :name="iconName" :size="iconSize" />
				<span>{{ title }}</span>
			</div>
			<slot name="description">
				<div v-if="showDescription" class="body-card-description">{{ description }}</div>
			</slot>
		</div>
		<div class="body-card-content">
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { IconProps } from "@/components/Icon/Icon.vue";

export interface BodyCardProps {
	title: string;
	iconName: IconProps["name"];
	iconSize?: IconProps["size"];
	description?: string;
}

const props = withDefaults(defineProps<BodyCardProps>(), {
	iconSize: 22
});

const showDescription = computed(
	() => typeof props.description === "string" && props.description.trim() !== ""
);
</script>

<style lang="scss" scoped>
.body-card {
	padding: $zl-padding * 2;
	padding-bottom: 0;
}
.body-card-head {
	margin-bottom: $zl-padding;
	display: flex;
}
.body-card-title {
	font-size: 20px;
	font-weight: bold;
	height: 28px;
	color: var(--el-text-color-primary);
	display: flex;
	align-items: center;
}
.body-card-icon {
	margin-right: 10px;
	color: var(--el-color-primary);
}
.body-card-description {
	flex-grow: 1;
	min-width: 0;
	margin-left: 8px;
	font-size: 12px;
	color: var(--el-text-color-secondary);
	align-self: flex-end;
}
</style>
