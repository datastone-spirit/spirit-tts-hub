<!--
 * @Author: mulingyuer
 * @Date: 2025-10-16 15:12:15
 * @LastEditTime: 2025-10-16 15:15:54
 * @LastEditors: mulingyuer
 * @Description: 主体卡片
 * @FilePath: \frontend\src\views\index-tts2\components\BodyCard.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="body-card">
		<div class="body-card-title">
			<Icon class="body-card-icon" :name="iconName" :size="iconSize" />
			<span>{{ title }}</span>
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
}

withDefaults(defineProps<BodyCardProps>(), {
	iconSize: 22
});
</script>

<style lang="scss" scoped>
.body-card {
	padding: $zl-padding * 2;
	padding-bottom: 0;
}
.body-card-title {
	margin-bottom: $zl-padding;
	font-size: 20px;
	font-weight: bold;
	color: var(--el-text-color-primary);
	display: flex;
	align-items: center;
}
.body-card-icon {
	margin-right: 10px;
	color: var(--el-color-primary);
}
</style>
