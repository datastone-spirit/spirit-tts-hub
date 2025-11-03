<!--
 * @Author: mulingyuer
 * @Date: 2025-10-22 10:35:54
 * @LastEditTime: 2025-11-03 15:05:07
 * @LastEditors: mulingyuer
 * @Description: 示例抽屉
 * @FilePath: \frontend\src\views\index-tts2\components\ExampleDrawer\index.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-drawer class="example-drawer" v-model="show" direction="ltr" size="65%">
		<template #header>
			<div class="example-drawer-header">
				<Icon class="example-drawer-header-icon" name="ri-lightbulb-line" size="20" />
				<h2 class="example-drawer-header-title">参考示例</h2>
			</div>
		</template>
		<div class="example-drawer-content">
			<el-empty v-if="!Boolean(data.length)" />
			<table v-else class="example-drawer-table">
				<colgroup>
					<col class="col-1" />
					<col class="col-2" />
					<col class="col-3" />
					<col class="col-4" />
					<col class="col-5" />
					<col class="col-6" />
				</colgroup>
				<thead>
					<tr>
						<th>参考音频</th>
						<th>情感控制方式</th>
						<th>生成内容</th>
						<th>情感参考音频</th>
						<th>专家模式</th>
						<th>控制</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item, index) in data" :key="index">
						<td>{{ getFileNameFromPath(item?.spk_audio_prompt) }}</td>
						<td>{{ getEmoControlMethodLabel(item.emo_control_method) }}</td>
						<td>{{ item.text }}</td>
						<td>{{ getFileNameFromPath(item.emo_ref_path) }}</td>
						<td>
							<el-tag v-if="item.isExpert" type="success">是</el-tag>
							<el-tag v-else type="info">否</el-tag>
						</td>
						<td>
							<ElSpacePro>
								<ElButton @click="onView(item)">查看</ElButton>
								<ElButton @click="onApply(item)">应用</ElButton>
							</ElSpacePro>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</el-drawer>
	<el-dialog v-model="openDialog" title="详细配置" width="900" align-center>
		<el-descriptions class="el-descriptions-vertical-top" :column="2" border label-width="170">
			<el-descriptions-item label="参考音频" :span="2">
				{{ getFileNameFromPath(viewData?.spk_audio_prompt) }}
			</el-descriptions-item>
			<el-descriptions-item label="参考音频路径" :span="2">
				{{ viewData?.spk_audio_prompt }}
			</el-descriptions-item>
			<el-descriptions-item label="情感控制方式" :span="2">
				{{ getEmoControlMethodLabel(viewData?.emo_control_method) }}
			</el-descriptions-item>
			<el-descriptions-item label="情感参考音频" :span="2">
				{{ getFileNameFromPath(viewData?.emo_ref_path) }}
			</el-descriptions-item>
			<el-descriptions-item label="情感参考音频路径" :span="2">
				{{ viewData?.emo_ref_path }}
			</el-descriptions-item>
			<el-descriptions-item label="文本分段最大Token">
				{{ viewData?.max_text_tokens_per_segment }}
			</el-descriptions-item>
			<el-descriptions-item label="情感控制权重">
				{{ viewData?.emo_weight }}
			</el-descriptions-item>
			<el-descriptions-item label="随机情绪采样">
				{{ viewData?.emo_random }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-快乐">
				{{ viewData?.vec1 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-生气">
				{{ viewData?.vec2 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-难过">
				{{ viewData?.vec3 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-害怕">
				{{ viewData?.vec4 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-厌恶">
				{{ viewData?.vec5 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-忧郁">
				{{ viewData?.vec6 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-惊讶">
				{{ viewData?.vec7 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-平静">
				{{ viewData?.vec8 }}
			</el-descriptions-item>
			<el-descriptions-item label="情感描述">
				{{ viewData?.prompt }}
			</el-descriptions-item>
			<el-descriptions-item label="启用 GPT-2 样本抽取">
				{{ viewData?.do_sample }}
			</el-descriptions-item>
			<el-descriptions-item label="GPT-2 采样温度">
				{{ viewData?.temperature }}
			</el-descriptions-item>
			<el-descriptions-item label="top_p"> {{ viewData?.top_p }} </el-descriptions-item>
			<el-descriptions-item label="top_k"> {{ viewData?.top_k }} </el-descriptions-item>
			<el-descriptions-item label="num_beams"> {{ viewData?.num_beams }} </el-descriptions-item>
			<el-descriptions-item label="重复惩罚">
				{{ viewData?.repetition_penalty }}
			</el-descriptions-item>
			<el-descriptions-item label="长度惩罚"> {{ viewData?.length_penalty }} </el-descriptions-item>
			<el-descriptions-item label="最大生成令牌数">
				{{ viewData?.max_mel_tokens }}
			</el-descriptions-item>
			<el-descriptions-item label="生成内容" :span="2">
				<div class="descriptions-text">
					{{ viewData?.text }}
				</div>
			</el-descriptions-item>
		</el-descriptions>
	</el-dialog>
</template>

<script setup lang="ts">
import type { ExampleData, ExampleItem } from "../../types";
import { EXAMPLE_DATA } from "./example-data";
import { getEmoControlMethodLabel, getFileNameFromPath } from "../../helper";

const emit = defineEmits<{
	/** 应用示例配置 */
	"apply-example": [item: ExampleItem];
}>();

const show = defineModel({ type: Boolean, required: true });
const data = reactive<ExampleData>(EXAMPLE_DATA);
const openDialog = ref(false);
const viewData = ref<ExampleItem>();

/** 查看 */
function onView(item: ExampleItem) {
	viewData.value = item;
	openDialog.value = true;
}
/** 应用 */
function onApply(item: ExampleItem) {
	show.value = false;
	emit("apply-example", toRaw(item));
}
</script>

<style lang="scss">
.example-drawer {
	--el-drawer-padding-primary: 24px;
	.el-drawer__header {
		margin-bottom: 10px;
	}
	.el-drawer__body {
		padding-top: 0;
	}
}
</style>
<style lang="scss" scoped>
@use "sass:math";

.example-drawer-header {
	display: flex;
	align-items: center;
}
.example-drawer-header-icon {
	color: var(--el-color-primary);
	margin-right: $zl-padding;
}
.example-drawer-header-title {
	font-size: 16px;
	font-weight: bold;
	color: var(--el-text-color-primary);
}
.example-drawer-table {
	width: 100%;
	table-layout: fixed;
	border-collapse: separate;
	border-spacing: 0;
	border: 1px solid var(--el-border-color);
	border-radius: math.div($zl-border-radius, 2);
}
.example-drawer-table th,
.example-drawer-table td {
	padding: 8px;
	border-right: 1px solid var(--el-border-color);
	border-bottom: 1px solid var(--el-border-color);
	color: var(--el-text-color-primary);
}
.example-drawer-table th:last-child,
.example-drawer-table td:last-child {
	border-right: none;
}
.example-drawer-table tbody tr:hover td {
	background-color: var(--el-fill-color);
}
.example-drawer-table tbody tr:last-child td {
	border-bottom: none;
	&:first-child {
		border-bottom-left-radius: math.div($zl-border-radius, 2);
	}
	&:last-child {
		border-bottom-right-radius: math.div($zl-border-radius, 2);
	}
}
.example-drawer-table thead th {
	background-color: var(--zl-tts2-table-th-bg);
	text-align: left;
	height: 40px;
	&:first-child {
		border-top-left-radius: math.div($zl-border-radius, 2);
	}
	&:last-child {
		border-top-right-radius: math.div($zl-border-radius, 2);
	}
}
.example-drawer-table tbody td {
	background-color: var(--zl-tts2-table-td-bg);
	word-break: break-all;
	transition: background-color 0.25s ease;
}
.example-drawer-table .col-1,
.example-drawer-table .col-4 {
	width: 180px;
}
.example-drawer-table .col-2 {
	width: 180px;
}
.example-drawer-table .col-3 {
	width: 300px;
}
.example-drawer-table .col-5 {
	width: 80px;
}
.example-drawer-table .col-6 {
	width: 160px;
}
.descriptions-text {
	white-space: pre-wrap;
	max-height: 300px;
	overflow: auto;
}
</style>
