/*
 * @Author: mulingyuer
 * @Date: 2025-10-31 09:58:58
 * @LastEditTime: 2025-10-31 17:13:30
 * @LastEditors: mulingyuer
 * @Description: 假进度条
 * @FilePath: \frontend\src\hooks\useProgress.ts
 * 怎么可能会有bug！！！
 */

export interface Options {
	/** 进度最小增量（默认 0.02）  */
	minimum?: number;
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
	| "idle" // 初始状态
	| "pending" // 运行中
	| "done" // 完成
	| "stop"; // 停止

const DEFAULT_OPTIONS: Required<Omit<Options, "onProgress" | "onFinish">> = {
	minimum: 0.02,
	speed: 300,
	formatter: (progress: number) => {
		if (typeof progress !== "number") return 0;
		return Math.min(100, Math.round(progress * 100));
	}
};

export function useProgress(options?: Options) {
	const {
		minimum = DEFAULT_OPTIONS.minimum,
		speed = DEFAULT_OPTIONS.speed,
		formatter = DEFAULT_OPTIONS.formatter,
		onProgress,
		onFinish
	} = options ?? {};
	const progressRef = ref(0);
	const formatProgress = computed(() => formatter(progressRef.value));
	const progressState = ref<ProgressState>("idle");
	const timeoutSpeed = ref(speed);
	const timerRef = ref<ReturnType<typeof setTimeout>>();

	/** 开始 */
	function start(seed: number = 1) {
		// 防止重复启动
		if (progressState.value === "pending") return;

		// 重置状态和进度
		clearTimer();
		progressRef.value = 0;
		progressState.value = "pending";

		// 根据种子数动态调整速度
		// 种子数越大，时间间隔越长，进度条就越慢
		if (typeof seed === "number" && seed > 0) {
			timeoutSpeed.value = speed * (1 + seed / 100);
		} else {
			timeoutSpeed.value = speed;
		}

		// 自循环
		const work = () => {
			timerRef.value = setTimeout(() => {
				// 停止或结束
				if (["done", "stop"].includes(progressState.value)) {
					timerRef.value = void 0;
					return;
				}

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
		clearTimer();
		progressState.value = "stop";
	}

	/** 结束 */
	function done() {
		clearTimer();
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
			// 初始阶段
			amount = 0.03;
		} else if (n >= 0.25 && n < 0.55) {
			// 中间阶段
			amount = 0.015;
		} else if (n >= 0.55 && n < 0.85) {
			// 后半段
			amount = 0.008;
		} else if (n >= 0.85 && n < 0.99) {
			// 接近完成时
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
		value = clamp(value, minimum, 1);
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

	/** 清理定时器 */
	function clearTimer() {
		if (timerRef.value) {
			clearTimeout(timerRef.value);
			timerRef.value = void 0;
		}
	}

	/** 重置 */
	function reset() {
		clearTimer();
		progressRef.value = 0;
		progressState.value = "idle";
		timeoutSpeed.value = speed;
	}

	return {
		progress: formatProgress,
		rawProgress: readonly(progressRef),
		progressState: readonly(progressState),
		progressControl: {
			start,
			stop,
			done,
			reset,
			clearTimer
		}
	};
}
