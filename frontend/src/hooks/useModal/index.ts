/*
 * @Author: mulingyuer
 * @Date: 2025-11-18 15:39:28
 * @LastEditTime: 2025-11-20 17:15:18
 * @LastEditors: mulingyuer
 * @Description: 模态框管理
 * @FilePath: \frontend\src\hooks\useModal\index.ts
 * 怎么可能会有bug！！！
 */
import type { ModalInstance, OpenOptions, PersistentOptions } from "./types";
export type * from "./types";

interface InternalModal<T = any> extends ModalInstance<T> {
	persistent?: boolean | PersistentOptions;
	_key?: string; // 内部计算出的唯一 key
}

class ModalManager {
	private modals = ref<InternalModal[]>([]);

	/** 打开弹窗 */
	public open<T = any>(options: OpenOptions): Promise<T> {
		const { component, props, persistent } = options;

		// 计算唯一 key，用于复用
		const key = this.computeKey(options);

		// 查看是否已经存在可复用弹窗
		const existing = key ? this.modals.value.find((m) => m._key === key && m.persistent) : null;

		if (existing) {
			existing.props = props;
			existing.visible = true;
			return new Promise((resolve, reject) => {
				existing.resolve = resolve;
				existing.reject = reject;
			});
		}

		// 创建弹窗
		return new Promise((resolve, reject) => {
			const modalId = Symbol("modal");

			const instance: InternalModal<T> = {
				modalId,
				visible: false,
				component: markRaw(component),
				props,
				resolve,
				reject,
				persistent,
				_key: key
			};

			this.modals.value.push(instance);

			// HACK: Element Plus 弹窗的open事件会在 “由关闭 → 打开” 的状态变化中触发，所以这里等下一个 tick 时设置为true
			nextTick().finally(() => {
				const modal = this.getByModalId(modalId);
				if (!modal) return;

				modal.visible = true;
			});
		});
	}

	/** 确认关闭（resolve） */
	public confirm<T>(modalId: symbol, value?: T) {
		const modal = this.getByModalId(modalId);
		if (!modal) return;

		modal.resolve?.(value as T);
		modal.resolve = void 0;
		modal.reject = void 0;

		// 关闭弹窗，不销毁
		modal.visible = false;
	}

	/** 取消关闭（reject） */
	public cancel(modalId: symbol, reason?: any) {
		const modal = this.getByModalId(modalId);
		if (!modal) return;

		modal.reject?.(reason);
		modal.resolve = void 0;
		modal.reject = void 0;

		// 关闭弹窗，不销毁
		modal.visible = false;
	}

	/** 关闭弹窗的回调方法，用于销毁非常驻弹窗 */
	public closed(modalId: symbol) {
		const modal = this.getByModalId(modalId);
		if (!modal) return;

		if (typeof modal.reject === "function") {
			modal.reject(new Error("用户取消了"));
			modal.resolve = void 0;
			modal.reject = void 0;
		}

		// 非常驻弹窗，销毁
		if (!modal.persistent) {
			this.removeByModalId(modal.modalId);
		}
	}

	/** 获取当前弹窗栈（仅供渲染层使用） */
	public get list() {
		return this.modals.value as readonly ModalInstance[];
	}

	/** 手动销毁常驻弹窗实例 */
	public destroyPersistent(options: OpenOptions) {
		if (!options.persistent) return;

		const key = this.computeKey(options);
		if (!key) return;

		this.modals.value = this.modals.value.filter((m) => m._key !== key);
	}

	/** 销毁全部弹窗 */
	public destroyAll() {
		this.modals.value = [];
	}

	/** 计算唯一 key */
	private computeKey(options: OpenOptions): string | undefined {
		const { component, props = {}, persistent } = options;
		if (!persistent) return void 0;

		const config = typeof persistent === "boolean" ? {} : persistent;

		// 情况1：全局单例模式
		if (config.singleton) {
			return `__singleton__${this.getComponentIdentifier(component)}`;
		}

		// 情况2：手动指定 key
		if (config.key) return config.key;

		// 情况3：动态生成 key
		if (config.keyGenerator) return config.keyGenerator(props);

		// 兜底：如果用户写了 persistent: true 但没配任何 key，降级为 singleton
		return `__singleton__${this.getComponentIdentifier(component)}`;
	}

	// 辅助方法：安全获取组件标识（避免 (component as any).name 的类型污染）
	private getComponentIdentifier(component: Component): string {
		// Vue 组件有 name > displayName > 文件名 > 随机
		return (
			(component as any).name ||
			(component as any).displayName ||
			(component as any).__file?.split("/").pop()?.replace(".vue", "") ||
			"anonymous"
		);
	}

	/** 通过modalId获取弹窗实例 */
	private getByModalId(modalId: symbol): InternalModal | undefined {
		return this.modals.value.find((m) => m.modalId === modalId);
	}

	/** 通过modalId删除弹窗实例 */
	private removeByModalId(modalId: symbol) {
		this.modals.value = this.modals.value.filter((m) => m.modalId !== modalId);
	}
}

// 单例导出
const modalManager = new ModalManager();

export function useModal() {
	return modalManager;
}
