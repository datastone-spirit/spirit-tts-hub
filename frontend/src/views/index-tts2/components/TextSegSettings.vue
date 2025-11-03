<!--
 * @Author: mulingyuer
 * @Date: 2025-10-15 17:00:27
 * @LastEditTime: 2025-11-03 14:48:03
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
				<NumericRangeControl
					v-model="ruleForm.max_text_tokens_per_segment"
					:min="minTokenCount"
					:max="maxTokenCount"
					:disabled="loading"
					step-strictly
					:reset-default="120"
					:show-reset-icon="false"
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
						<tr v-if="previewData.segments.length === 0">
							<td colspan="3">
								<div class="table-empty">暂无数据</div>
							</td>
						</tr>
						<template v-else>
							<tr v-for="item in previewData.segments" :key="item.index">
								<td>{{ item.index }}</td>
								<td>{{ item.content }}</td>
								<td>{{ item.token_count }}</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { usePageForm } from "../composables/usePageForm";
import { previewTextSegments, type PreviewTextSegmentsResult } from "@/api/index-tts2";

export interface TextSegSettingsProps {
	/** 每生成段最小令牌数 */
	minTokenCount?: number;
	/** 每生成段最大令牌数 */
	maxTokenCount?: number;
}

const _props = withDefaults(defineProps<TextSegSettingsProps>(), {
	minTokenCount: 20,
	maxTokenCount: 600
});

const { ruleForm } = usePageForm();
const loading = ref(false);
const previewData = ref<PreviewTextSegmentsResult>({
	segments: []
});

/** api */
async function getTextSeg() {
	try {
		const text = ruleForm.value.text;
		if (typeof text !== "string" || text.trim() === "") return;

		loading.value = true;

		const result = await previewTextSegments({
			max_text_tokens_per_segment: ruleForm.value.max_text_tokens_per_segment,
			text: ruleForm.value.text
		});

		previewData.value = result;

		loading.value = false;
	} catch (error) {
		loading.value = false;

		console.error("获取文本分段失败：", error);
	}
}

/** 滑块值改变 */
const onSliderChange = useDebounceFn(async (_value: number | number[]) => {
	getTextSeg();
}, 500);

/** 数字值改变 */
const onInputNumberChange = useDebounceFn(async (_currentValue: number | undefined) => {
	getTextSeg();
}, 1000);

/** 重置令牌数 */
async function onResetTokenCount() {
	getTextSeg();
}

/** 监听用户输入的文本 */
watch(() => ruleForm.value.text, useDebounceFn(getTextSeg, 1000), { immediate: true });
</script>

<style lang="scss" scoped>
@use "sass:math";

.text-seg-settings {
	width: 100%;
	line-height: normal;
}
.seg-settings {
	margin-bottom: $zl-padding * 2;
}
.seg-settings-label {
	font-size: 16px;
	color: var(--el-text-color-primary);
	margin-bottom: 8px;
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
}
.text-seg-preview-table th:last-child,
.text-seg-preview-table td:last-child {
	border-right: none;
}
.text-seg-preview-table tbody tr:hover td {
	background-color: var(--el-fill-color);
}
.text-seg-preview-table tbody tr:last-child td {
	border-bottom: none;
	&:first-child {
		border-bottom-left-radius: math.div($zl-border-radius, 2);
	}
	&:last-child {
		border-bottom-right-radius: math.div($zl-border-radius, 2);
	}
}
.text-seg-preview-table thead th {
	font-size: var(--el-font-size-base);
	color: var(--el-text-color-primary);
	background-color: var(--zl-tts2-table-th-bg);
	text-align: left;
	font-weight: normal;
	height: 40px;
	&:first-child {
		border-top-left-radius: math.div($zl-border-radius, 2);
	}
	&:last-child {
		border-top-right-radius: math.div($zl-border-radius, 2);
	}
}
.text-seg-preview-table tbody td {
	font-size: var(--el-font-size-base);
	color: var(--el-text-color-regular);
	background-color: var(--zl-tts2-table-td-bg);
	word-break: break-all;
	transition: background-color 0.25s ease;
	font-size: 14px;
	font-family: "IBM Plex Mono", ui-monospace, Consolas, monospace;
	letter-spacing: 0.1em;
	line-height: 1.6;
}
.text-seg-preview-table .col-index {
	width: 80px;
}
.text-seg-preview-table .col-content {
	width: auto;
	min-width: 300px;
}
.text-seg-preview-table .col-token {
	width: 120px;
}
.table-empty {
	text-align: center;
	font-size: var(--el-font-size-base);
	color: var(--el-text-color-secondary);
}
</style>
