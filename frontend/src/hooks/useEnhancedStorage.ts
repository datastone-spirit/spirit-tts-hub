/*
 * @Author: mulingyuer
 * @Date: 2024-12-30 11:31:58
 * @LastEditTime: 2025-10-21 11:56:58
 * @LastEditors: mulingyuer
 * @Description: 自定义useLocalStorage
 * @FilePath: \frontend\src\hooks\useEnhancedStorage.ts
 * 怎么可能会有bug！！！
 */
import { deepMerge, SerializeUndefined } from "@/utils/tools";
import type { RemovableRef } from "@vueuse/core";

export interface EnhancedLocalStorageOptions<T = any> {
	/** 缓存的key */
	localKey: string;
	/** 初始值 */
	defaultValue: T;
	/** 版本号 */
	version: string;
	/** 黑名单，例： ['sessionToken','user.profile.avatar','posts[0].isPinned'] */
	blacklist?: string[];
}

/** 辅助方法 */
class Helper {
	/**
	 * 根据路径字符串安全地从对象中取值
	 * @param obj - 源对象
	 * @param path - 路径字符串，例如 'a.b[0].c'
	 */
	public static get(obj: any, path: string): any {
		// 将 'a.b[0].c' 转换为 ['a', 'b', '0', 'c']
		const pathArray = path.replace(/\[(\w+)\]/g, ".$1").split(".");
		let current = obj;
		for (const key of pathArray) {
			if (current === null || current === undefined) {
				return undefined;
			}
			current = current[key];
		}
		return current;
	}

	/**
	 * 根据路径字符串安全地向对象中赋值
	 * @param obj - 目标对象
	 * @param path - 路径字符串，例如 'a.b[0].c'
	 * @param value - 要设置的值
	 */
	public static set(obj: any, path: string, value: any): any {
		const pathArray = path.replace(/\[(\w+)\]/g, ".$1").split(".");
		let current = obj;

		for (let i = 0; i < pathArray.length - 1; i++) {
			const key = pathArray[i]!;
			if (current[key] === void 0 || typeof current[key] !== "object" || current[key] === null) {
				// 如果路径不存在，则停止操作，以防创建意外的结构
				// 因为我们的逻辑是“恢复”值，所以路径应该总是存在的
				return obj;
			}
			current = current[key];
		}

		const lastKey = pathArray[pathArray.length - 1]!;
		if (typeof current === "object" && current !== null) {
			current[lastKey] = value;
		}
		return obj;
	}
}

export function useEnhancedStorage() {
	/** 增强版的 useLocalStorage Ref
	 * 在从 localStorage 读取数据时，会校验其数据结构是否与默认值一致
	 * 如果不一致（例如，应用版本更新导致数据结构变更），则会使用默认值，防止程序出错
	 * @param localKey - localStorage 的键。
	 * @param defaultValue - 默认值，也作为结构校验的“模板”。
	 */
	function useEnhancedLocalStorage<T = any>(
		options: EnhancedLocalStorageOptions<T>
	): RemovableRef<T> {
		const { localKey, version, defaultValue, blacklist = [] } = options;

		return useLocalStorage<T>(localKey, defaultValue, {
			serializer: {
				read(raw) {
					try {
						if (!raw) return structuredClone(options.defaultValue);

						const parsedValue = JSON.parse(raw);

						// 检查版本号
						if (parsedValue.version !== version) return structuredClone(options.defaultValue);
						// 检查数据是否存在
						if (!parsedValue?.data) return structuredClone(options.defaultValue);

						const deserializedValue = SerializeUndefined.deserialize(parsedValue.data);

						// 缓存的值优先生效，而默认值只是提供缺失字段
						return deepMerge(structuredClone(defaultValue), deserializedValue);
					} catch (error) {
						console.error("解析缓存的数据失败", error);
						return structuredClone(options.defaultValue);
					}
				},
				write: (value) => {
					const rawValue = toRaw(value);

					// 黑名单逻辑 — 仅在确实需要时克隆
					let workingValue = rawValue;

					// 黑名单
					if (blacklist.length > 0) {
						workingValue = structuredClone(rawValue);

						blacklist.forEach((key) => {
							// 获取黑名单属性默认值
							const val = structuredClone(Helper.get(defaultValue, key));
							// 设置黑名单属性为默认值
							Helper.set(workingValue, key, val);
						});
					}

					// 将 undefined 替换为占位符
					const serialized = SerializeUndefined.serialize(workingValue);

					return JSON.stringify({
						version,
						data: serialized
					});
				}
			}
		});
	}

	return {
		useEnhancedLocalStorage
	};
}
