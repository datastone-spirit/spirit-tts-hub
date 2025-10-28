/*
 * @Author: mulingyuer
 * @Date: 2025-09-28 15:22:03
 * @LastEditTime: 2025-10-27 16:35:59
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

export interface DirectoryResult {
	/** 文件夹名 */
	basename: string;
	/** 文件扩展名 */
	extension: string;
	/** 元数据 */
	extra_metadata: Array<any>;
	/** 最后修改时间 s */
	last_modified: number;
	/** 文件夹路径 */
	path: string;
	/** 类型 */
	type: "dir";
	/** 是否可见 */
	visibility: string;
}

export interface FileResult {
	/** 文件名 */
	basename: string;
	/** 文件扩展名 */
	extension: string;
	/** 元数据 */
	extra_metadata: Array<any>;
	/** 最后修改时间 s */
	last_modified: number;
	/** 文件路径 */
	path: string;
	/** 类型 */
	type: "file";
	/** 是否可见 */
	visibility: string;
	/** 文件大小 byte */
	file_size: number;
	/** 文件 MIME 类型 */
	mime_type: string;
}

/** 获取文件信息结果 */
export type FileInfoResult =
	| undefined
	| {
			adapter: string;
			/** 目录名称：/root/flux-context/upload */
			dirname: string;
			/** 适配器名称 */
			storages: Array<string>;
			/** 文件列表 */
			files: Array<DirectoryResult | FileResult>;
	  };
