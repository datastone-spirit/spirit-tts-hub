<!--
 * @Author: mulingyuer
 * @Date: 2025-10-11 16:52:56
 * @LastEditTime: 2025-10-11 16:59:09
 * @LastEditors: mulingyuer
 * @Description: 跳过按钮
 * @FilePath: \frontend\src\components\Audio\SkipButton.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-button type="text" :icon="ButtonIcon" circle text />
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";

export interface RewindButtonProps {
	iconName?: string;
	iconSize?: string | number;
}

const props = withDefaults(defineProps<RewindButtonProps>(), {
	iconName: "ri-speed-fill",
	iconSize: 20
});
const ButtonIcon = useIcon({ name: props.iconName, size: props.iconSize });
</script>

<style scoped></style>
