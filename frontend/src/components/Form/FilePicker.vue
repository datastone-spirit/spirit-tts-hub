<!--
 * @Author: mulingyuer
 * @Date: 2025-10-24 10:48:30
 * @LastEditTime: 2025-11-19 12:18:19
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
				:size="componentSize"
				:disabled="loading"
				@keydown.enter="onKeydownEnter"
			>
				<template #append>
					<el-button
						:icon="RiFileLine"
						title="请选择"
						:size="componentSize"
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
import { getFileInfo, type FileResult } from "@/api/common";
import type { PathPickerDialogProps } from "@/components/Dialog/PathPickerDialog.vue";
import PathPickerDialog from "@/components/Dialog/PathPickerDialog.vue";
import { useIcon } from "@/hooks/useIcon";
import { useModal } from "@/hooks/useModal";
import { useSettingsStore } from "@/stores";
import { getEnv } from "@/utils/env";
import { validateMimeType } from "@/utils/tools";
import type { ComponentSize } from "element-plus";
import { formContextKey } from "element-plus";

export interface FilePickerProps {
	/** 占位符 */
	placeholder?: string;
	/** 大小 */
	size?: ComponentSize;
	/** 指定文件类型，例如："image/*"、"image/"、"image/png"，不支持不带斜杠的类型 */
	mimeType?: string;
	/** 是否开启回车确认 */
	confirmOnEnter?: boolean;
}

const props = withDefaults(defineProps<FilePickerProps>(), {
	placeholder: "请输入或选择文件",
	confirmOnEnter: false
});
const emit = defineEmits<{
	/** 确认选择 */
	confirm: [file: FileResult];
}>();
const formContext = inject(formContextKey, undefined);
const componentSize = computed<ComponentSize>(() => props.size ?? formContext?.size ?? "default");

// icon
const iconSize = computed(() => {
	switch (componentSize.value) {
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
const RiFileLine = useIcon({ name: "ri-file-line", size: iconSize.value });
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
		type: "file",
		mimeType: props.mimeType,
		basePath: modelValue.value
	};
	model
		.open({
			component: PathPickerDialog,
			props: modelProps
		})
		.then((item: FileResult) => {
			modelValue.value = item.path;
			emit("confirm", item);
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

		const findFile = result.files.find((item): item is FileResult => {
			return item.path === modelValue.value && item.type === "file";
		});
		if (!findFile) {
			loading.value = false;
			ElMessage.error("文件不存在");
			return;
		}

		// mime type 校验
		const mimeType = props.mimeType;
		if (typeof mimeType === "string" && mimeType.trim() !== "") {
			const isValid = validateMimeType(findFile.mime_type, mimeType);
			if (!isValid) {
				loading.value = false;
				ElMessage.error(`请选择正确的 ${mimeType} 类型内容`);
				return;
			}
		}

		emit("confirm", findFile);
		loading.value = false;
	} catch (error) {
		loading.value = false;

		console.error("获取文件信息发生错误：", error);
	}
}
</script>

<style lang="scss" scoped>
.file-picker {
	width: 100%;
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
