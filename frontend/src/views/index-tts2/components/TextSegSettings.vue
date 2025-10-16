<!--
 * @Author: mulingyuer
 * @Date: 2025-10-15 17:00:27
 * @LastEditTime: 2025-10-16 16:50:52
 * @LastEditors: mulingyuer
 * @Description: 文本分段设置
 * @FilePath: \frontend\src\views\index-tts2\components\TextSegSettings.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="text-seg-settings">
		<div class="seg-settings">
			<div class="seg-settings-label">最大Token</div>
			<div class="seg-settings-content">
				<ValueSlider
					v-model="tokenCount"
					:min="minTokenCount"
					:max="maxTokenCount"
					:disabled="loading"
					step-strictly
					:reset-default="120"
					@slider-change="onSliderChange"
					@input-number-change="onInputNumberChange"
					@reset-token-count="onResetTokenCount"
				/>
			</div>
			<div class="seg-settings-info">
				推荐范围：80 - 200。较大的值需要更多的 VRAM，但可以改善语音的流畅性，而较小的值需要较少的
				VRAM，但意味着句子更碎片化。过小或过大的值可能导致语音不够连贯。
			</div>
		</div>
		<div class="text-seg-preview">
			<div class="text-seg-preview-title">预览</div>
			<div class="text-seg-preview-content" v-loading="loading">
				<table class="text-seg-preview-table">
					<colgroup>
						<col class="col-index" />
						<col class="col-content" />
						<col class="col-token" />
					</colgroup>
					<thead>
						<tr>
							<th>序号</th>
							<th>内容</th>
							<th>token数量</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>0</td>
							<td>"▁撒▁打▁算▁打▁算▁打▁算"</td>
							<td>14</td>
						</tr>
						<tr>
							<td>0</td>
							<td>
								"▁撒▁打▁算▁打▁算▁打▁算▁撒▁打▁算▁打▁算▁打▁算▁撒▁打▁算▁打▁算▁打▁算▁撒▁打▁算▁打▁算▁打▁算▁撒▁打▁算▁打▁算▁打▁算▁撒▁打▁算▁打▁算▁打▁算▁撒▁打▁算▁打▁算▁打▁算▁撒▁打▁算▁打▁算▁打▁算▁撒▁打▁算▁打▁算▁打▁算▁撒▁打▁算▁打▁算▁打▁算▁撒▁打▁算▁打▁算▁打▁算"
							</td>
							<td>14</td>
						</tr>
						<tr>
							<td>0</td>
							<td>"▁撒▁打▁算▁打▁算▁打▁算"</td>
							<td>14</td>
						</tr>
						<tr>
							<td>0</td>
							<td>"▁撒▁打▁算▁打▁算▁打▁算"</td>
							<td>14</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { sleep } from "@/utils/tools";

export interface TextSegSettingsProps {
	/** 每生成段最小令牌数 */
	minTokenCount?: number;
	/** 每生成段最大令牌数 */
	maxTokenCount?: number;
}

const tokenCount = defineModel({ type: Number, required: true });
const _props = withDefaults(defineProps<TextSegSettingsProps>(), {
	minTokenCount: 20,
	maxTokenCount: 600
});

const loading = ref(false);

/** 滑块值改变 */
const onSliderChange = useDebounceFn(async (_value: number | number[]) => {
	loading.value = true;
	await sleep(2000);
	loading.value = false;
}, 500);

/** 数字值改变 */
const onInputNumberChange = useDebounceFn(async (_currentValue: number | undefined) => {
	loading.value = true;
	await sleep(2000);
	loading.value = false;
}, 1000);

/** 重置令牌数 */
async function onResetTokenCount() {
	loading.value = true;
	await sleep(2000);
	loading.value = false;
}
</script>

<style lang="scss" scoped>
@use "sass:math";

.text-seg-settings {
	width: 100%;
}
.seg-settings {
	margin-bottom: $zl-padding * 2;
}
.seg-settings-label {
	font-size: 16px;
	color: var(--el-text-color-primary);
	margin-bottom: 8px;
}
.seg-settings-content {
	// display: flex;
	// align-items: center;
}
.seg-settings-slider {
	flex-grow: 1;
	min-width: 0;
}
.seg-settings-controls {
	flex-shrink: 0;
	margin-left: $zl-padding;
	display: flex;
	align-items: center;
}
.seg-settings-reset-button {
	background-color: var(--el-fill-color-light);
}
.seg-settings-info {
	margin-top: $zl-padding;
	font-size: 14px;
	color: var(--el-text-color-secondary);
}
.text-seg-preview-title {
	font-size: 16px;
	color: var(--el-text-color-primary);
	margin-bottom: 8px;
}
.text-seg-preview-content {
	overflow: auto;
}
.text-seg-preview-table {
	width: 100%;
	table-layout: fixed;
	border-collapse: separate;
	border-spacing: 0;
	border: 1px solid var(--el-border-color);
	border-radius: math.div($zl-border-radius, 2);
}
.text-seg-preview-table th,
.text-seg-preview-table td {
	padding: 8px;
	border-right: 1px solid var(--el-border-color);
	border-bottom: 1px solid var(--el-border-color);
	color: var(--el-text-color-primary);
}
.text-seg-preview-table th:last-child,
.text-seg-preview-table td:last-child {
	border-right: none;
}
.text-seg-preview-table tbody tr:last-child td {
	border-bottom: none;
}
.text-seg-preview-table thead th {
	background-color: var(--zl-tts2-seg-th-bg);
	text-align: left;
	font-weight: normal;
	&:first-child {
		border-top-left-radius: math.div($zl-border-radius, 2);
	}
	&:last-child {
		border-top-right-radius: math.div($zl-border-radius, 2);
	}
}
.text-seg-preview-table tbody td {
	background-color: var(--zl-tts2-seg-td-bg);
}
.text-seg-preview-table .col-index {
	width: 120px;
}
.text-seg-preview-table .col-content {
	width: auto;
	min-width: 300px;
}
.text-seg-preview-table .col-token {
	width: 160px;
}
</style>
