<!--
 * @Author: mulingyuer
 * @Date: 2025-10-27 11:27:38
 * @LastEditTime: 2025-10-27 11:33:34
 * @LastEditors: mulingyuer
 * @Description: 基础分割线
 * @FilePath: \frontend\src\components\UI\BaseDivider.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-divider class="base-divider" :class="{ 'no-margin': noMargin }" v-bind="$attrs" />
</template>

<script setup lang="ts">
import type { DividerProps } from "element-plus";
export interface BaseDividerProps extends Partial<DividerProps> {
	/** 是否禁用margin */
	noMargin?: boolean;
}

withDefaults(defineProps<BaseDividerProps>(), {
	noMargin: false
});
</script>

<style lang="scss" scoped>
.base-divider {
	margin-bottom: 0;
	&.no-margin {
		margin: 0px;
	}
}
</style>
