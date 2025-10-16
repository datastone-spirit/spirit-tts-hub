<!--
 * @Author: mulingyuer
 * @Date: 2025-10-11 16:36:54
 * @LastEditTime: 2025-10-16 15:24:28
 * @LastEditors: mulingyuer
 * @Description: 倒带按钮
 * @FilePath: \frontend\src\components\Audio\RewindButton.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-button type="text" :icon="ButtonIcon" circle text :size="size" />
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";
import type { ComponentSize } from "element-plus";

export interface RewindButtonProps {
	iconName?: string;
	iconSize?: string | number;
	/** 按钮大小 */
	size?: ComponentSize;
}

const props = withDefaults(defineProps<RewindButtonProps>(), {
	iconName: "ri-rewind-fill",
	iconSize: 20,
	size: "default"
});
const ButtonIcon = useIcon({ name: props.iconName, size: props.iconSize });
</script>

<style scoped></style>
