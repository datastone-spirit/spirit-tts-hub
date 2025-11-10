<!--
 * @Author: mulingyuer
 * @Date: 2025-10-27 11:37:32
 * @LastEditTime: 2025-11-10 14:31:23
 * @LastEditors: mulingyuer
 * @Description: 基础卡片
 * @FilePath: \frontend\src\components\UI\BaseCard.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="base-card" v-bind="$attrs">
		<h3 class="base-card-title">{{ title }}</h3>
		<div class="base-card-content">
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
export interface BaseCardProps {
	/** 标题 */
	title: string;
}

withDefaults(defineProps<BaseCardProps>(), {});
</script>

<style lang="scss" scoped>
.base-card-title {
	font-size: 16px;
	font-weight: bold;
	height: 70px;
	display: flex;
	align-items: center;
	color: var(--el-text-color-primary);
}
</style>
