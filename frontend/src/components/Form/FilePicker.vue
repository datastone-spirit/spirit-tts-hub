<!--
 * @Author: mulingyuer
 * @Date: 2025-10-24 10:48:30
 * @LastEditTime: 2025-10-24 17:21:23
 * @LastEditors: mulingyuer
 * @Description: 文件选择器
 * @FilePath: \frontend\src\components\Form\FilePicker.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="file-picker">
		<div class="file-picker-head">
			<el-input
				class="file-picker-input"
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
		<div class="file-picker-footer">
			<el-button class="file-picker-btn" type="primary" :size="size">确认选择</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";
import { useModalManager, type FileResult } from "@/hooks/useModalManager";
import { getEnv } from "@/utils/env";
import { useSettingsStore } from "@/stores";
import type { ComponentSize } from "element-plus";

export interface FilePickerProps {
	/** 占位符 */
	placeholder?: string;
	/** 大小 */
	size?: ComponentSize;
	/** 指定文件类型 */
	mimeType?: string;
}

const props = withDefaults(defineProps<FilePickerProps>(), {
	placeholder: "请输入或选择文件",
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
const { showFileDialog } = useModalManager();
const showTooltip = computed(() => settingsStore.whiteCheck);
const tooltipContent = `如果挂载了存储请使用挂载存储所使用的路径，如：${env.VITE_APP_OUTPUT_PARENT_PATH} 开头的路径`;

/** 显示选择器 */
function onShowSelector() {
	showFileDialog({
		path: modelValue.value,
		type: "file"
	})
		.then((item: FileResult) => {
			// mime 校验
			if (typeof props.mimeType === "string" && props.mimeType.trim() !== "") {
				if (!item.mime_type || !item.mime_type.startsWith(props.mimeType.toLowerCase())) {
					ElMessage.error(`请选择正确的 ${props.mimeType} 文件`);
					return;
				}
			}

			modelValue.value = item.path;
			emit("confirm", { name: item.basename, path: item.path });
		})
		.catch(() => {});
}
</script>

<style lang="scss" scoped>
.file-picker {
	width: 100%;
	height: 165px;
}
.file-picker-head {
	width: 100%;
	display: flex;
	gap: $zl-padding;
}
.file-picker-footer {
	margin-top: $zl-padding;
	text-align: right;
}
</style>
