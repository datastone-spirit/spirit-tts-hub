<!--
 * @Author: mulingyuer
 * @Date: 2025-10-24 11:28:50
 * @LastEditTime: 2025-10-28 15:52:31
 * @LastEditors: mulingyuer
 * @Description: 文件/目录选择弹窗
 * @FilePath: \frontend\src\components\ModalManager\Dialog\PathPickerDialog.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-dialog
		id="file-dialog-vuefinder"
		class="file-dialog"
		width="700"
		v-model="pathPickerDialogData.show"
		align-center
		@close="onClose"
	>
		<vue-finder
			:features="features"
			:request="request"
			:path="pathPickerDialogData.path"
			:select-button="handleSelectButton"
			class="file-finder"
		/>
	</el-dialog>
</template>

<script setup lang="ts">
import { useModalManager } from "@/hooks/useModalManager";
import { getEnv } from "@/utils/env";
import { validateMimeType } from "@/utils/tools";

const env = getEnv();
const { pathPickerDialogData, resolvePathPickerDialog, rejectPathPickerDialog } = useModalManager();

const features = ["select", "preview", "newfolder"];
const handleSelectButton = {
	active: true,
	multiple: false,
	click: (items: any, event: any) => {
		event.preventDefault();
		const item = items[0];

		// 判断类型
		switch (pathPickerDialogData.value.type) {
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
		const mimeType = pathPickerDialogData.value.mime_type;
		if (typeof mimeType === "string" && mimeType.trim() !== "") {
			const isValid = validateMimeType(item.mime_type, mimeType);
			if (!isValid) {
				ElMessage.error(`请选择正确的 ${mimeType} 类型内容`);
				return;
			}
		}

		// 用户选择成功，resolve Promise
		resolvePathPickerDialog(item);
	}
};
const request = computed(() => {
	return {
		baseUrl: `${env.VITE_APP_API_BASE_URL}/files/file`,
		params: {
			additionalParam1: "yes",
			path: computed(() => pathPickerDialogData.value.path)
		},
		body: { additionalBody1: ["yes"] },
		transformRequest: (req: any) => {
			if (req.method === "get") {
				req.params.vf = "1";
			}
			if (req.method === "post") {
				refresh();
			}
			return req;
		},
		headers: { "X-ADDITIONAL-HEADER": "yes" },
		xsrfHeaderName: "CSRF-TOKEN"
	};
});

/** 刷新文件管理器 */
function refresh() {
	setTimeout(() => {
		const refreshSvg = document.querySelector(`#file-dialog-vuefinder span[title='Refresh'] svg`);
		if (refreshSvg) {
			(refreshSvg as HTMLElement).style.pointerEvents = "all";
			refreshSvg?.dispatchEvent(new Event("click", { bubbles: true }));
		}
	}, 500);
}

/** 弹窗关闭 */
function onClose() {
	// 用户点击右上角关闭或按 ESC，视为取消
	rejectPathPickerDialog(new Error("用户取消选择"));
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
