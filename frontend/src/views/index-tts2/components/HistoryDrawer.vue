<!--
 * @Author: mulingyuer
 * @Date: 2025-10-22 16:00:10
 * @LastEditTime: 2025-10-27 10:58:57
 * @LastEditors: mulingyuer
 * @Description: 历史记录抽屉
 * @FilePath: \frontend\src\views\index-tts2\components\HistoryDrawer.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-drawer class="history-drawer" v-model="show" direction="ltr" size="75%">
		<template #header>
			<div class="history-drawer-header">
				<Icon class="history-drawer-header-icon" name="ri-history-line" size="20" />
				<h2 class="history-drawer-header-title">历史记录</h2>
			</div>
		</template>
		<div class="history-drawer-content">
			<el-empty v-if="!Boolean(historyData.length)" />
			<table v-else class="history-drawer-table">
				<colgroup>
					<col class="col-1" />
					<col class="col-2" />
					<col class="col-3" />
					<col class="col-4" />
					<col class="col-5" />
					<col class="col-6" />
					<col class="col-7" />
				</colgroup>
				<thead>
					<tr>
						<th>参考音频</th>
						<th>情感控制方式</th>
						<th>生成内容</th>
						<th>情感参考音频</th>
						<th>专家模式</th>
						<th>创建时间</th>
						<th>控制</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in historyData" :key="item.id">
						<td>{{ item.referenceAudioName }}</td>
						<td>{{ getEmotionControlStrategyName(item.emotionControlStrategy) }}</td>
						<td>{{ item.text }}</td>
						<td>{{ item.emotionReferenceAudioName }}</td>
						<td>
							<el-tag v-if="item.isExpert" type="success">是</el-tag>
							<el-tag v-else type="info">否</el-tag>
						</td>
						<td>{{ formatDate(item.createTime, "YYYY-MM-DD HH:mm:ss") }}</td>
						<td>
							<ElSpacePro>
								<el-button @click="onView(item)">查看</el-button>
								<el-button @click="onApply(item)">应用</el-button>
								<el-button type="danger" plain @click="onDelete(item)">删除</el-button>
							</ElSpacePro>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<template #footer> <el-button @click="onClear">清空</el-button> </template>
	</el-drawer>
	<el-dialog v-model="openDialog" title="详细配置" width="900" align-center>
		<el-descriptions :column="2" border label-width="170">
			<el-descriptions-item label="ID" :span="2">
				{{ viewData?.id }}
			</el-descriptions-item>
			<el-descriptions-item label="创建时间" :span="2">
				{{ formatDate(viewData!.createTime, "YYYY-MM-DD HH:mm:ss") }}
			</el-descriptions-item>
			<el-descriptions-item label="参考音频" :span="2">
				{{ viewData?.referenceAudioName }}
			</el-descriptions-item>
			<el-descriptions-item label="参考音频路径" :span="2">
				{{ viewData?.referenceAudioPath }}
			</el-descriptions-item>
			<el-descriptions-item label="生成内容" :span="2"> {{ viewData?.text }} </el-descriptions-item>
			<el-descriptions-item label="情感控制方式" :span="2">
				{{ getEmotionControlStrategyName(viewData?.emotionControlStrategy) }}
			</el-descriptions-item>
			<el-descriptions-item label="情感参考音频" :span="2">
				{{ viewData?.emotionReferenceAudioName }}
			</el-descriptions-item>
			<el-descriptions-item label="情感参考音频路径" :span="2">
				{{ viewData?.emotionReferenceAudioPath }}
			</el-descriptions-item>
			<el-descriptions-item label="文本分段最大Token">
				{{ viewData?.maxTokensPerSegment }}
			</el-descriptions-item>
			<el-descriptions-item label="情感控制权重">
				{{ viewData?.externalEmotionStrength }}
			</el-descriptions-item>
			<el-descriptions-item label="随机情绪采样">
				{{ viewData?.enableRandomEmotion }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-快乐">
				{{ viewData?.emotionStrengths.happy }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-生气">
				{{ viewData?.emotionStrengths.angry }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-难过">
				{{ viewData?.emotionStrengths.sad }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-害怕">
				{{ viewData?.emotionStrengths.afraid }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-厌恶">
				{{ viewData?.emotionStrengths.disgusted }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-忧郁">
				{{ viewData?.emotionStrengths.melancholic }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-惊讶">
				{{ viewData?.emotionStrengths.surprised }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-平静">
				{{ viewData?.emotionStrengths.calm }}
			</el-descriptions-item>
			<el-descriptions-item label="情感描述">
				{{ viewData?.emotionDescription }}
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
		</el-descriptions>
	</el-dialog>
</template>

<script setup lang="ts">
import { useEmotionControlStrategy } from "../composables/useEmotionControlStrategy";
import { useHistory } from "../composables/useHistory";
import type { HistoryItem } from "../types";
import { formatDate } from "@/utils/dayjs";

const emit = defineEmits<{
	/** 应用历史记录 */
	"apply-history": [item: HistoryItem];
}>();

const { getEmotionControlStrategyName } = useEmotionControlStrategy();

const show = defineModel({ type: Boolean, required: true });
const { historyData, deleteHistory, clearHistory } = useHistory();
const openDialog = ref(false);
const viewData = ref<HistoryItem>();

/** 查看 */
function onView(item: HistoryItem) {
	viewData.value = item;
	openDialog.value = true;
}
/** 应用 */
function onApply(item: HistoryItem) {
	show.value = false;
	emit("apply-history", toRaw(item));
}
/** 删除 */
function onDelete(item: HistoryItem) {
	deleteHistory(item.id);

	ElMessage.success("删除成功");
}
/** 清空 */
function onClear() {
	clearHistory();

	ElMessage.success("历史记录已清空");
}
</script>

<style lang="scss">
.history-drawer {
	--el-drawer-padding-primary: 24px;
	.el-drawer__header {
		margin-bottom: 10px;
	}
	.el-drawer__body {
		padding-top: 0;
	}
	.el-drawer__footer {
		padding-top: 0;
	}
}
</style>
<style lang="scss" scoped>
@use "sass:math";

.history-drawer-header {
	display: flex;
	align-items: center;
}
.history-drawer-header-icon {
	color: var(--el-color-primary);
	margin-right: $zl-padding;
}
.history-drawer-header-title {
	font-size: 16px;
	font-weight: bold;
	color: var(--el-text-color-primary);
}
.history-drawer-table {
	width: 100%;
	table-layout: fixed;
	border-collapse: separate;
	border-spacing: 0;
	border: 1px solid var(--el-border-color);
	border-radius: math.div($zl-border-radius, 2);
}
.history-drawer-table th,
.history-drawer-table td {
	padding: 8px;
	border-right: 1px solid var(--el-border-color);
	border-bottom: 1px solid var(--el-border-color);
	color: var(--el-text-color-primary);
}
.history-drawer-table th:last-child,
.history-drawer-table td:last-child {
	border-right: none;
}
.history-drawer-table tbody tr:hover td {
	background-color: var(--el-fill-color);
}
.history-drawer-table tbody tr:last-child td {
	border-bottom: none;
	&:first-child {
		border-bottom-left-radius: math.div($zl-border-radius, 2);
	}
	&:last-child {
		border-bottom-right-radius: math.div($zl-border-radius, 2);
	}
}
.history-drawer-table thead th {
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
.history-drawer-table tbody td {
	background-color: var(--zl-tts2-table-td-bg);
	word-break: break-all;
	transition: background-color 0.25s ease;
}
.history-drawer-table .col-1,
.history-drawer-table .col-4 {
	width: 180px;
}
.history-drawer-table .col-2 {
	width: 180px;
}
.history-drawer-table .col-3 {
	width: 300px;
}
.history-drawer-table .col-5 {
	width: 80px;
}
.history-drawer-table .col-6 {
	width: 180px;
}
.history-drawer-table .col-7 {
	width: 220px;
}
</style>
