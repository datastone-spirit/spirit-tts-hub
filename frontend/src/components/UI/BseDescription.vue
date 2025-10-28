<!--
 * @Author: mulingyuer
 * @Date: 2025-10-27 11:43:26
 * @LastEditTime: 2025-10-27 11:44:33
 * @LastEditors: mulingyuer
 * @Description: 基础描述
 * @FilePath: \frontend\src\components\UI\BseDescription.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="description-item">
		<div class="description-item-label">
			<slot name="label">{{ label }}</slot>
		</div>
		<div class="description-item-value">
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
export interface BseDescriptionProps {
	/** 标签 */
	label: string;
}

defineProps<BseDescriptionProps>();
</script>

<style lang="scss" scoped>
.description-item {
	display: flex;
	align-items: flex-start;
	color: var(--el-text-color-primary);

	& + & {
		margin-top: 16px;
	}
}

.description-item-label {
	flex-shrink: 0;
	min-width: 152px;
	font-size: 14px;
	line-height: 20px;
}

.description-item-value {
	font-size: 14px;
	line-height: 20px;
	color: var(--el-text-color-regular);
}
</style>
