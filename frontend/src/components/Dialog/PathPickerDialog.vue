<!--
 * @Author: mulingyuer
 * @Date: 2025-10-24 11:28:50
 * @LastEditTime: 2025-11-19 11:17:38
 * @LastEditors: mulingyuer
 * @Description: 文件/目录选择弹窗
 * @FilePath: \frontend\src\components\ModalManager\Dialog\PathPickerDialog2.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-dialog
		id="file-dialog-vuefinder"
		class="file-dialog"
		width="700"
		v-model="show"
		align-center
		@open="onOpen"
		@close="onClose"
	>
		<vue-finder
			:features="features"
			:request="request"
			:path="basePath"
			:select-button="handleSelectButton"
			class="file-finder"
		/>
	</el-dialog>
</template>

<script setup lang="ts">
// import { useModalManager } from "@/hooks/useModalManager";
import { getEnv } from "@/utils/env";
import { validateMimeType } from "@/utils/tools";
import type { BaseModalProps, BaseModalEmit } from "@/hooks/useModal";

/** 文件选择器类型 */
export type PathPickerDialogType =
	| "file" // 文件
	| "directory" // 目录
	| "both"; // 文件和目录

export interface PathPickerDialogProps {
	/** 弹窗类型 */
	type: PathPickerDialogType;
	/** mime type */
	mimeType?: string;
	/** 初始路径 */
	basePath: string;
}

const show = defineModel({ type: Boolean, required: true });
const props = withDefaults(defineProps<PathPickerDialogProps & BaseModalProps>(), {
	type: "both",
	mimeType: "",
	basePath: "/"
});
const emit = defineEmits<BaseModalEmit>();

const env = getEnv();
// const { pathPickerDialogData, resolvePathPickerDialog, rejectPathPickerDialog } = useModalManager();
const isInit = ref(false);

const features = ["select", "preview", "newfolder"];
const handleSelectButton = {
	active: true,
	multiple: false,
	click: (items: any, event: any) => {
		event.preventDefault();
		const item = items[0];

		// 判断类型
		switch (props.type) {
			case "file":
				if (item.type !== "file") {
					return ElMessage.error("请选择文件");
				}
				break;
			case "directory":
				if (item.type !== "dir") {
					return ElMessage.error("请选择文件夹");
				}
				break;
			case "both":
			default:
				break;
		}

		// mime type 校验
		if (typeof props.mimeType === "string" && props.mimeType.trim() !== "") {
			const isValid = validateMimeType(item.mime_type, props.mimeType);
			if (!isValid) {
				ElMessage.error(`请选择正确的 ${props.mimeType} 类型内容`);
				return;
			}
		}

		// 用户选择成功，resolve Promise
		emit("confirm", item);
	}
};
const request = computed(() => {
	return {
		baseUrl: `${env.VITE_APP_API_BASE_URL}/files/file`,
		params: {
			additionalParam1: "yes",
			path: computed(() => props.basePath)
		},
		body: { additionalBody1: ["yes"] },
		transformRequest: (req: any) => {
			if (req.method === "get") {
				req.params.vf = "1";
			}
			if (req.method === "post") {
				setTimeout(() => {
					refresh();
				}, 500);
			}
			return req;
		},
		headers: { "X-ADDITIONAL-HEADER": "yes" },
		xsrfHeaderName: "CSRF-TOKEN"
	};
});

/** 刷新文件管理器 */
function refresh() {
	const refreshSvg = document.querySelector(`#file-dialog-vuefinder span[title='Refresh'] svg`);
	if (refreshSvg) {
		(refreshSvg as HTMLElement).style.pointerEvents = "all";
		refreshSvg?.dispatchEvent(new Event("click", { bubbles: true }));
	}
}

/** 弹窗打开 */
function onOpen() {
	if (!isInit.value) {
		isInit.value = true;
		return;
	}

	refresh();
}

/** 弹窗关闭 */
function onClose() {
	// 用户点击右上角关闭或按 ESC，视为取消
	emit("cancel", new Error("用户取消选择"));
}
</script>

<style lang="scss">
.file-dialog {
	height: 500px;
}
.vuefinder__main__container {
	min-height: 460px !important;
}
.vuefinder__main__content {
	min-height: 350px !important;
	max-height: 350px !important;
}
.vuefinder__treeview__header,
.vuefinder__status-bar__storage,
.vuefinder__status-bar__about {
	visibility: hidden;
	display: none;
}
.Toggle.Tree.View {
	display: none;
}
.vuefinder .vuefinder__main__relative {
	resize: none;
}
</style>
