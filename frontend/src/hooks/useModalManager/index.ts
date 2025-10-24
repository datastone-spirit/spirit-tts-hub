/*
 * @Author: mulingyuer
 * @Date: 2025-10-24 11:25:51
 * @LastEditTime: 2025-10-24 17:12:48
 * @LastEditors: mulingyuer
 * @Description: 全局弹窗管理 hooks，存放弹窗状态数据等其他逻辑
 * @FilePath: \frontend\src\hooks\useModalManager\index.ts
 * 怎么可能会有bug！！！
 */
import type { FileDialogController, FileDialogData, FileDialogOptions } from "./types";
export type * from "./types";

/** 文件/目录选择弹窗 */
const fileDialogData = reactive<FileDialogData>({
	show: false,
	path: "",
	type: "both"
});
const fileDialogController: FileDialogController = {
	resolve: null,
	reject: null,
	async show(options: FileDialogOptions) {
		return new Promise((resolve, reject) => {
			// 设置配置
			fileDialogData.path = options.path;
			fileDialogData.type = options.type ?? "both";
			fileDialogData.show = true;

			// 挂载 resolve/reject
			this.resolve = resolve;
			this.reject = reject;
		});
	}
};

export function useModalManager() {
	return {
		fileDialogData,
		showFileDialog: fileDialogController.show.bind(fileDialogController),
		resolveFileDialog: (data: any) => {
			if (fileDialogController.resolve) {
				fileDialogController.resolve(data);
				fileDialogController.resolve = null;
				fileDialogController.reject = null;
				fileDialogData.show = false;
			}
		},
		rejectFileDialog: (reason?: any) => {
			if (fileDialogController.reject) {
				fileDialogController.reject(reason);
				fileDialogController.resolve = null;
				fileDialogController.reject = null;
				fileDialogData.show = false;
			}
		}
	};
}
