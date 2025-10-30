/*
 * @Author: mulingyuer
 * @Date: 2025-10-24 11:25:51
 * @LastEditTime: 2025-10-30 16:55:14
 * @LastEditors: mulingyuer
 * @Description: 全局弹窗管理 hooks，存放弹窗状态数据等其他逻辑
 * @FilePath: \frontend\src\hooks\useModalManager\index.ts
 * 怎么可能会有bug！！！
 */
import type {
	PathPickerDialogController,
	PathPickerDialogData,
	PathPickerDialogOptions
} from "./types";
export type * from "./types";
import { resettableRef } from "@/utils/ref";

/** 文件/目录选择弹窗 */
const [pathPickerDialogData, _resetPathPickerDialogData] = resettableRef<PathPickerDialogData>({
	show: false,
	path: "",
	type: "both",
	mime_type: void 0
});
const pathPickerDialogController: PathPickerDialogController = {
	resolve: null,
	reject: null,
	async show(options: PathPickerDialogOptions) {
		return new Promise((resolve, reject) => {
			// 设置配置
			pathPickerDialogData.value.path = options.path;
			pathPickerDialogData.value.type = options.type ?? "both";
			pathPickerDialogData.value.mime_type = options.mime_type;
			pathPickerDialogData.value.show = true;

			// 挂载 resolve/reject
			this.resolve = resolve;
			this.reject = reject;
		});
	}
};

export function useModalManager() {
	return {
		pathPickerDialogData,
		showPathPickerDialog: pathPickerDialogController.show.bind(pathPickerDialogController),
		resolvePathPickerDialog: (data: any) => {
			if (pathPickerDialogController.resolve) {
				pathPickerDialogController.resolve(data);
				pathPickerDialogController.resolve = null;
				pathPickerDialogController.reject = null;
				pathPickerDialogData.value.show = false;
			}
		},
		rejectPathPickerDialog: (reason?: any) => {
			if (pathPickerDialogController.reject) {
				pathPickerDialogController.reject(reason);
				pathPickerDialogController.resolve = null;
				pathPickerDialogController.reject = null;
				pathPickerDialogData.value.show = false;
			}
		}
	};
}
