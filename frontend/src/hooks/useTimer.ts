/*
 * @Author: mulingyuer
 * @Date: 2025-11-04 09:37:04
 * @LastEditTime: 2025-11-04 10:37:02
 * @LastEditors: mulingyuer
 * @Description: 计时器
 * @FilePath: \frontend\src\hooks\useTimer.ts
 * 怎么可能会有bug！！！
 */

export interface TimerOptions {
	/** 每次执行的回调 */
	callback?: () => void;
}

export function useTimer(options: TimerOptions = {}) {
	const { callback } = options;

	/** 是否在运行 */
	const isRunning = ref(false);
	/** 已统计时间（毫秒ms） */
	const elapsedTime = ref(0);

	/** 动画id */
	let animationId: number | null = null;
	/** 定时器开始时间 */
	let startTime: number = 0;
	/** 定时器停止累积的时间 */
	let stopTime: number = 0;

	/** 动画回调 */
	const animationCallback = () => {
		if (!isRunning.value) return;

		// 计算时间
		const now = performance.now();
		elapsedTime.value = stopTime + (now - startTime);

		// 回调
		callback?.();

		// 下一个动画帧
		animationId = requestAnimationFrame(animationCallback);
	};

	/** 开始计时 */
	const start = (shouldContinue: boolean = false) => {
		if (isRunning.value) return;

		if (!shouldContinue) reset();

		isRunning.value = true;
		// 记录当前时间
		startTime = performance.now();
		animationId = requestAnimationFrame(animationCallback);
	};

	/** 暂停计时 */
	const pause = () => {
		if (!isRunning.value) return;

		isRunning.value = false;
		// 取消动画帧
		if (animationId) {
			cancelAnimationFrame(animationId);
			animationId = null;
		}

		// 计算时间
		const now = performance.now();
		elapsedTime.value = stopTime + (now - startTime);

		// 累积时间
		stopTime = elapsedTime.value;
	};

	/** 停止计时 */
	const stop = () => {
		if (!isRunning.value) return;

		isRunning.value = false;
		// 取消动画帧
		if (animationId) {
			cancelAnimationFrame(animationId);
			animationId = null;
		}
		elapsedTime.value = 0;
		startTime = 0;
		stopTime = 0;
	};

	/** 重置 */
	const reset = () => {
		pause();
		elapsedTime.value = 0;
		startTime = 0;
		stopTime = 0;
	};

	return {
		isRunning,
		elapsedTime,
		start,
		pause,
		stop,
		reset
	};
}
