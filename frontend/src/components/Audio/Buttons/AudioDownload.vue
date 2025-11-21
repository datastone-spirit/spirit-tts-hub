<!--
 * @Author: mulingyuer
 * @Date: 2025-11-20 09:07:02
 * @LastEditTime: 2025-11-20 09:12:03
 * @LastEditors: mulingyuer
 * @Description: 音频下载按钮
 * @FilePath: \frontend\src\components\Audio\Buttons\AudioDownload.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-button :type="type" :icon="RiIcon" text circle :size="size" @click="onDownload"></el-button>
</template>

<script setup lang="ts">
import { useIcon, type UseIconProps } from "@/hooks/useIcon";
import type { ButtonProps } from "element-plus";
import { getEnv } from "@/utils/env";
import { downloadFile } from "@/utils/tools";

export interface AudioDownloadProps {
	/** 音频地址 */
	url: string | undefined;
	/** 按钮大小 */
	size?: ButtonProps["size"];
	/** 按钮类型 */
	type?: ButtonProps["type"];
	/** icon 大小 */
	iconSize?: UseIconProps["size"];
	/** icon 名称 */
	iconName?: UseIconProps["name"];
}

const props = withDefaults(defineProps<AudioDownloadProps>(), {
	type: "primary",
	size: "small",
	iconName: "ri-download-line",
	iconSize: 18
});

// icon
const RiIcon = useIcon({ name: props.iconName, size: props.iconSize });

const env = getEnv();

const onDownload = () => {
	if (typeof props.url !== "string" || props.url.trim() === "") return;
	const url = `${env.VITE_APP_API_BASE_URL}/tts/download?filepath=${encodeURIComponent(props.url)}`;
	downloadFile(url);
};
</script>

<style scoped></style>
