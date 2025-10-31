/*
 * @Author: mulingyuer
 * @Date: 2025-10-31 09:58:58
 * @LastEditTime: 2025-10-31 16:31:10
 * @LastEditors: mulingyuer
 * @Description: 假进度条
 * @FilePath: \frontend\src\hooks\useProgress.ts
 * 怎么可能会有bug！！！
 */

export interface Options {
	/** 进度最小增量（默认 0.02）  */
	minimun?: number;
	/** 自动递增的时间间隔（毫秒，默认 300） */
	speed?: number;
	/** 自定义格式化函数，默认格式化为 0-100 的整数 */
	formatter?: (progress: number) => any;
	/** 进度更新回调 */
	onProgress?: (progress: number, raw: number) => void;
	/** 进度完成（done）时的回调 */
	onFinish?: () => void;
}

/** 进度条状态 */
export type ProgressState =
	| "ide" // 初始状态
	| "pending" // 运行中
	| "done" // 完成
	| "stop"; // 停止

const DEFAULT_OPTIONS: Required<Omit<Options, "onProgress" | "onFinish">> = {
	minimun: 0.02,
	speed: 300,
	formatter: (progress: number) => {
		if (typeof progress !== "number") return 0;
		return Math.min(100, Math.round(progress * 100));
	}
};

export function useProgress(options?: Options) {
	const {
		minimun = DEFAULT_OPTIONS.minimun,
		speed = DEFAULT_OPTIONS.speed,
		formatter = DEFAULT_OPTIONS.formatter,
		onProgress,
		onFinish
	} = options ?? {};
	const progressRef = ref(0);
	const formatProgress = computed(() => formatter(progressRef.value));
	const progressState = ref<ProgressState>("ide");
	const timeoutSpeed = ref(speed);

	/** 开始 */
	function start(seed: number = 1) {
		// 防止重复启动
		if (progressState.value === "pending") return;

		// 重置状态和进度
		progressRef.value = 0;
		progressState.value = "pending";

		// 根据种子数动态调整速度
		// 种子数越大，时间间隔越长，进度条就越慢
		// 这里的乘数因子 `(1 + seed / 100)` 是一个示例，你可以根据实际需求调整其计算逻辑
		if (seed && seed > 0) {
			timeoutSpeed.value = speed * (1 + seed / 100);
		} else {
			timeoutSpeed.value = speed;
		}

		// 自循环
		const work = () => {
			setTimeout(() => {
				// 停止或结束
				if (["done", "stop"].includes(progressState.value)) return;

				// 往前推进
				trickle();

				// 自循环
				work();
			}, timeoutSpeed.value);
		};

		work(); // 启动自循环
	}

	/** 停止 */
	function stop() {
		progressState.value = "stop";
	}

	/** 结束 */
	function done() {
		progressState.value = "done";
		setProgress(1);
	}

	/** 往前推进进度条 */
	function trickle() {
		const n = progressRef.value;
		if (n > 1) return;

		// 前进量
		let amount: number;
		if (n >= 0 && n < 0.25) {
			// 初始阶段，从原来的 0.1 (10%) 大幅降为 0.03 (3%)
			amount = 0.03;
		} else if (n >= 0.25 && n < 0.55) {
			// 中间阶段，从原来的 0.04 (4%) 降为 0.015 (1.5%)
			amount = 0.015;
		} else if (n >= 0.55 && n < 0.85) {
			// 后半段，从原来的 0.02 (2%) 降为 0.008 (0.8%)
			amount = 0.008;
		} else if (n >= 0.85 && n < 0.99) {
			// 接近完成时，从原来的 0.005 (0.5%) 降为 0.002 (0.2%)
			amount = 0.002;
		} else {
			// 接近 100% 时不再自动推进
			amount = 0;
		}
		const newValue = clamp(n + amount, 0, 0.994);

		setProgress(newValue);
	}

	/** 计算值在指定范围 */
	function clamp(n: number, min: number, max: number) {
		if (n < min) return min;
		if (n > max) return max;
		return n;
	}

	/** 设置进度条值 */
	function setProgress(value: number) {
		value = clamp(value, minimun, 1);
		progressRef.value = value;

		// 钩子
		onProgress?.(formatter(value), value);

		if (value >= 1) {
			progressState.value = "done";
			setTimeout(() => {
				onFinish?.();
			}, timeoutSpeed.value);
		}
	}

	return {
		progress: formatProgress,
		rawProgress: readonly(progressRef),
		progressState: readonly(progressState),
		progressControl: {
			start,
			stop,
			done
		}
	};
}
