/*
 * @Author: mulingyuer
 * @Date: 2025-11-07 12:26:36
 * @LastEditTime: 2025-11-07 12:31:01
 * @LastEditors: mulingyuer
 * @Description: 配置接口类型
 * @FilePath: \frontend\src\api\config\types.ts
 * 怎么可能会有bug！！！
 */

/** 获取配置结果 */
export interface ConfigResult {
	/** 历史记录路径 */
	history_path: string;
	/** 输出路径 */
	output_path: string;
	/** 上传路径 */
	upload_path: string;
}

/** 修改配置参数 */
export type UpdateConfigData = Required<ConfigResult>;
