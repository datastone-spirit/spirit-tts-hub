<!--
 * @Author: mulingyuer
 * @Date: 2025-11-19 17:37:00
 * @LastEditTime: 2025-11-20 08:25:05
 * @LastEditors: mulingyuer
 * @Description: 音频播放下载按钮
 * @FilePath: \frontend\src\components\Audio\Buttons\AudioPlayerDownloader.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-button :type="type" :icon="RiIcon" text circle :size="size" @click="onPlayer"></el-button>
</template>

<script setup lang="ts">
import { useIcon, type UseIconProps } from "@/hooks/useIcon";
import type { ButtonProps } from "element-plus";
import { useModal } from "@/hooks/useModal";
import AudioPlayerDialog from "@/components/Dialog/AudioPlayerDialog.vue";
import type { AudioPlayerDialogProps } from "@/components/Dialog/AudioPlayerDialog.vue";
import { getFileNameFromPath } from "@/utils/tools";

export interface AudioPlayerDownloaderProps {
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

const props = withDefaults(defineProps<AudioPlayerDownloaderProps>(), {
	type: "primary",
	size: "small",
	iconName: "ri-play-circle-line",
	iconSize: 18
});

// icon
const RiIcon = useIcon({ name: props.iconName, size: props.iconSize });

const modal = useModal();

/** 播放音频 */
const onPlayer = () => {
	if (typeof props.url !== "string" || props.url.trim() === "") return;
	const modalProps: AudioPlayerDialogProps = {
		url: props.url,
		name: getFileNameFromPath(props.url)
	};
	modal
		.open({
			component: AudioPlayerDialog,
			props: modalProps,
			persistent: {
				singleton: true
			}
		})
		.catch(() => {});
};

onUnmounted(() => {
	// 即时销毁
	modal.destroyPersistent({
		component: AudioPlayerDialog,
		persistent: {
			singleton: true
		}
	});
});
</script>

<style scoped></style>
