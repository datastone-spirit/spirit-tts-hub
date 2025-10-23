<!--
 * @Author: mulingyuer
 * @Date: 2025-10-22 17:25:52
 * @LastEditTime: 2025-10-22 17:40:59
 * @LastEditors: mulingyuer
 * @Description: 帮助卡片
 * @FilePath: \frontend\src\views\help\components\HelpCard.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="help-card">
		<h3 class="help-card-title">{{ title }}</h3>
		<div class="help-card-content">
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
export interface HelpCardProps {
	title: string;
}

defineProps<HelpCardProps>();
</script>

<style lang="scss" scoped>
.help-card-title {
	font-size: 16px;
	font-weight: bold;
	height: 70px;
	display: flex;
	align-items: center;
	color: var(--el-text-color-primary);
}
</style>
