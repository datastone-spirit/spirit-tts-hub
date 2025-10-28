/*
 * @Author: mulingyuer
 * @Date: 2024-12-04 16:17:03
 * @LastEditTime: 2025-10-27 11:51:42
 * @LastEditors: mulingyuer
 * @Description: 设置数据仓库的类型
 * @FilePath: \frontend\src\stores\modules\settings\types.ts
 * 怎么可能会有bug！！！
 */

/** 应用设置 */
export interface AppSettings {
	/** 文件上传保存路径 */
	uploadPath: string;
	/** 文件生成保存路径 */
	outputPath: string;
}
