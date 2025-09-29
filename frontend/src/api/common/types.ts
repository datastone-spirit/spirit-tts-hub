/*
 * @Author: mulingyuer
 * @Date: 2025-09-28 15:22:03
 * @LastEditTime: 2025-09-28 16:11:09
 * @LastEditors: mulingyuer
 * @Description: 公共接口类型
 * @FilePath: \frontend\src\api\common\types.ts
 * 怎么可能会有bug！！！
 */

import type { AxiosProgressEvent } from "axios";

/** 上传文件参数 */
export interface UploadFilesData {
	params: {
		/** 上传的文件路径 */
		upload_path: string;
		/** 由请求方生成的唯一的 upload_id，标识这一批上传的文件  */
		upload_id: string | number;
	};
	/** 上传的文件 */
	files: FormData;
	/** 进度条 */
	onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
}

/** 上传文件结果 */
export type UploadFilesResult = {
	/** 文件名 */
	filename: string;
	/** 路径 */
	path: string;
	/** 上传时间 */
	upload_time: string;
	/** 由请求方生成的唯一的 upload_id，标识这一批上传的文件 */
	upload_id: string;
};
