<!--
 * @Author: mulingyuer
 * @Date: 2025-10-27 11:26:01
 * @LastEditTime: 2025-11-10 14:31:39
 * @LastEditors: mulingyuer
 * @Description: 基础页面
 * @FilePath: \frontend\src\components\UI\BasePage.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="base-page" :class="{ 'show-footer': $slots.footer }" v-bind="$attrs">
		<div class="base-page-head">
			<h2 class="base-title">{{ title }}</h2>
		</div>
		<div class="base-body">
			<slot></slot>
		</div>
		<div v-if="$slots.footer" class="base-footer">
			<slot name="footer"></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
export interface BasePageProps {
	title: string;
}

withDefaults(defineProps<BasePageProps>(), {});
// const slots = useSlots();
</script>

<style lang="scss" scoped>
.base-page {
	height: 100%;
	display: flex;
	flex-direction: column;
}
.base-page.show-footer {
	.base-body {
		padding: 0 $zl-padding * 2 $zl-padding * 2 $zl-padding * 2;
	}
}
.base-page-head {
	flex-shrink: 0;
	padding: 0 $zl-padding * 2;
	height: 48px;
	display: flex;
	align-items: center;
	border-bottom: 1px var(--el-border-color) var(--el-border-style);
}
.base-title {
	flex-shrink: 0;
	font-size: 16px;
	line-height: 22px;
	font-weight: bold;
	color: var(--el-text-color-primary);
}
.base-body {
	flex-grow: 1;
	min-height: 0;
	padding: 0 $zl-padding * 2 $zl-padding * 6 $zl-padding * 2;
	overflow: auto;
}
.base-footer {
	flex-shrink: 0;
	border-top: 1px var(--el-border-color) var(--el-border-style);
	padding: $zl-padding $zl-padding * 2;
}
</style>
