<!--
 * @Author: mulingyuer
 * @Date: 2025-10-27 10:28:33
 * @LastEditTime: 2025-11-19 12:18:41
 * @LastEditors: mulingyuer
 * @Description: 目录选择器
 * @FilePath: \frontend\src\components\Form\FolderPicker.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="folder-picker">
		<div class="folder-picker-head">
			<el-input
				class="folder-picker-input"
				v-model="modelValue"
				:placeholder="placeholder"
				:size="size"
				:disabled="loading"
				@keydown.enter="onKeydownEnter"
			>
				<template #append>
					<el-button
						:icon="RiFolderLine"
						title="请选择"
						:size="size"
						:loading="loading"
						@click="onShowSelector"
					/>
				</template>
			</el-input>
			<el-tooltip v-if="showTooltip" placement="top" :content="tooltipContent">
				<el-button class="file-manager-info-btn" :icon="RiInformationLine" link />
			</el-tooltip>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";
import { getFileInfo, type DirectoryResult } from "@/api/common";
import type { PathPickerDialogProps } from "@/components/Dialog/PathPickerDialog.vue";
import PathPickerDialog from "@/components/Dialog/PathPickerDialog.vue";
import { useModal } from "@/hooks/useModal";
import { useSettingsStore } from "@/stores";
import { getEnv } from "@/utils/env";
import type { ComponentSize } from "element-plus";

export interface FilePickerProps {
	/** 占位符 */
	placeholder?: string;
	/** 大小 */
	size?: ComponentSize;
	/** 是否开启回车确认 */
	confirmOnEnter?: boolean;
}

const props = withDefaults(defineProps<FilePickerProps>(), {
	placeholder: "请输入或选择目录",
	size: "default",
	confirmOnEnter: false
});
const emit = defineEmits<{
	/** 确认选择 */
	confirm: [{ name: string; path: string }];
}>();

// icon
const iconSize = computed(() => {
	switch (props.size) {
		case "default":
			return "16px";
		case "small":
			return "14px";
		case "large":
			return "18px";
		default:
			return "16px";
	}
});
const RiFolderLine = useIcon({ name: "ri-folder-line", size: iconSize.value });
const RiInformationLine = useIcon({ name: "ri-information-line", size: iconSize.value });

const model = useModal();
const settingsStore = useSettingsStore();
const env = getEnv();
const modelValue = defineModel({ type: String, required: true });
const showTooltip = computed(() => settingsStore.whiteCheck);
const tooltipContent = `如果挂载了存储请使用挂载存储所使用的路径，如：${env.VITE_APP_OUTPUT_PARENT_PATH} 开头的路径`;
const loading = ref(false);

/** 显示选择器 */
function onShowSelector() {
	const modelProps: PathPickerDialogProps = {
		basePath: modelValue.value,
		type: "directory"
	};
	model
		.open({
			component: PathPickerDialog,
			props: modelProps
		})
		.then((item: DirectoryResult) => {
			modelValue.value = item.path;
			emit("confirm", { name: item.basename, path: item.path });
		})
		.catch(() => {});
}

/** 回车确认 */
async function onKeydownEnter() {
	try {
		if (!props.confirmOnEnter) return;
		loading.value = true;
		const result = await getFileInfo(modelValue.value);
		if (!result || (result as any).error) {
			loading.value = false;
			ElMessage.error("路径不正确，请输入正确的路径");
			return;
		}

		if (result.dirname === modelValue.value) {
			emit("confirm", { name: result.dirname.split("/").pop()!, path: result.dirname });
			loading.value = false;
			return;
		}

		const findFolder = result.files.find((item): item is DirectoryResult => {
			return item.path === modelValue.value && item.type === "dir";
		});
		if (!findFolder) {
			loading.value = false;
			ElMessage.error("目录不存在");
			return;
		}

		emit("confirm", { name: findFolder.basename, path: findFolder.path });
		loading.value = false;
	} catch (error) {
		loading.value = false;

		console.error("获取目录信息发生错误：", error);
	}
}
</script>

<style lang="scss" scoped>
.folder-picker {
	width: 100%;
}
.folder-picker-head {
	width: 100%;
	display: flex;
	gap: $zl-padding;
}
</style>
