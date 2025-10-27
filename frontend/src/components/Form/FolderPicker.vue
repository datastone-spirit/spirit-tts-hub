<!--
 * @Author: mulingyuer
 * @Date: 2025-10-27 10:28:33
 * @LastEditTime: 2025-10-27 10:44:28
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
			>
				<template #append>
					<el-button :icon="RiFolderLine" title="请选择" :size="size" @click="onShowSelector" />
				</template>
			</el-input>
			<el-tooltip v-if="showTooltip" placement="top" :content="tooltipContent">
				<el-button class="file-manager-info-btn" :icon="RiInformationLine" link />
			</el-tooltip>
		</div>
		<div class="folder-picker-footer">
			<el-button class="folder-picker-btn" type="primary" :size="size">确认选择</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";
import { useModalManager, type DirectoryResult } from "@/hooks/useModalManager";
import { getEnv } from "@/utils/env";
import { useSettingsStore } from "@/stores";
import type { ComponentSize } from "element-plus";

export interface FilePickerProps {
	/** 占位符 */
	placeholder?: string;
	/** 大小 */
	size?: ComponentSize;
}

const _props = withDefaults(defineProps<FilePickerProps>(), {
	placeholder: "请输入或选择目录",
	size: "default"
});
const emit = defineEmits<{
	/** 确认选择 */
	confirm: [{ name: string; path: string }];
}>();

// icon
const RiFolderLine = useIcon({ name: "ri-folder-line" });
const RiInformationLine = useIcon({ name: "ri-information-line" });

const settingsStore = useSettingsStore();
const env = getEnv();
const modelValue = defineModel({ type: String, required: true });
const { showPathPickerDialog } = useModalManager();
const showTooltip = computed(() => settingsStore.whiteCheck);
const tooltipContent = `如果挂载了存储请使用挂载存储所使用的路径，如：${env.VITE_APP_OUTPUT_PARENT_PATH} 开头的路径`;

/** 显示选择器 */
function onShowSelector() {
	showPathPickerDialog({
		path: modelValue.value,
		type: "directory"
	})
		.then((item: DirectoryResult) => {
			modelValue.value = item.path;
			emit("confirm", { name: item.basename, path: item.path });
		})
		.catch(() => {});
}
</script>

<style lang="scss" scoped>
.folder-picker {
	width: 100%;
	height: 165px;
}
.folder-picker-head {
	width: 100%;
	display: flex;
	gap: $zl-padding;
}
.folder-picker-footer {
	margin-top: $zl-padding;
	text-align: right;
}
</style>
