/*
 * @Author: mulingyuer
 * @Date: 2025-08-20 15:46:36
 * @LastEditTime: 2025-09-25 11:13:48
 * @LastEditors: mulingyuer
 * @Description: 设置的key值
 * @FilePath: \frontend\src\constants\config-keys.ts
 * 怎么可能会有bug！！！
 */
import { joinPrefixKey } from "@/utils/tools";

/** splitter持久化key */
export const SPLITTER_KEY = {
	INDEX_TTS2_LEFT_SIZE: joinPrefixKey("splitter_index_tts2_left_size"),
	INDEX_TTS2_RIGHT_SIZE: joinPrefixKey("splitter_index_tts2_right_size")
} as const;
