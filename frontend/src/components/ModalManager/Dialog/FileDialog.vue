<!--
 * @Author: mulingyuer
 * @Date: 2025-10-24 11:28:50
 * @LastEditTime: 2025-10-24 16:16:21
 * @LastEditors: mulingyuer
 * @Description: 文件/目录选择弹窗
 * @FilePath: \frontend\src\components\ModalManager\Dialog\FileDialog.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-dialog
		id="file-dialog-vuefinder"
		class="file-dialog"
		width="700"
		v-model="fileDialogData.show"
		align-center
		@close="onClose"
	>
		<vue-finder
			:features="features"
			:request="request"
			:select-button="handleSelectButton"
			class="file-finder"
		/>
	</el-dialog>
</template>

<script setup lang="ts">
import { useModalManager } from "@/hooks/useModalManager";
import { getEnv } from "@/utils/env";

const env = getEnv();
const { fileDialogData, resolveFileDialog, rejectFileDialog } = useModalManager();

const features = ["select", "preview", "newfolder", "delete"];
const handleSelectButton = {
	active: true,
	multiple: false,
	click: (items: any, event: any) => {
		event.preventDefault();
		const item = items[0];

		// 判断类型
		switch (fileDialogData.type) {
			case "file":
				if (item.type !== "file") {
					return ElMessage.error("请选择文件");
				}
				break;
			case "directory":
				if (item.type !== "directory") {
					return ElMessage.error("请选择文件夹");
				}
				break;
			case "both":
			default:
				break;
		}

		// 用户选择成功，resolve Promise
		resolveFileDialog(item);
	}
};
const request = computed(() => {
	return {
		baseUrl: `${env.VITE_APP_API_BASE_URL}/file`,
		params: {
			path: fileDialogData.path
		},
		body: { additionalBody1: ["yes"] },
		transformRequest: (req: any) => {
			if (req.method === "post") {
				refresh();
			}
			return req;
		},
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
	rejectFileDialog(new Error("用户取消选择"));
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
