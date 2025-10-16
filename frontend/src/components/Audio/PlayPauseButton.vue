<!--
 * @Author: mulingyuer
 * @Date: 2025-10-11 16:55:02
 * @LastEditTime: 2025-10-16 15:23:44
 * @LastEditors: mulingyuer
 * @Description: 播放&暂停按钮
 * @FilePath: \frontend\src\components\Audio\PlayPauseButton.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-button
		:type="isPlaying ? 'danger' : 'primary'"
		:icon="isPlaying ? PauseIcon : PlayIcon"
		circle
		text
		:size="size"
	/>
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";
import type { ComponentSize } from "element-plus";

export interface RewindButtonProps {
	/** 播放按钮图标名称 */
	playIconName?: string;
	/** 暂停按钮图标名称 */
	pauseIconName?: string;
	/** 图标大小 */
	iconSize?: string | number;
	/** 是否在播放 */
	isPlaying: boolean;
	/** 按钮大小 */
	size?: ComponentSize;
}

const props = withDefaults(defineProps<RewindButtonProps>(), {
	playIconName: "ri-play-fill",
	pauseIconName: "ri-pause-fill",
	iconSize: 32,
	size: "default"
});
const PlayIcon = useIcon({ name: props.playIconName, size: props.iconSize });
const PauseIcon = useIcon({ name: props.pauseIconName, size: props.iconSize });
</script>

<style scoped></style>
