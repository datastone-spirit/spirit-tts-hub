<!--
 * @Author: mulingyuer
 * @Date: 2025-10-22 16:00:10
 * @LastEditTime: 2025-11-07 11:52:01
 * @LastEditors: mulingyuer
 * @Description: 历史记录抽屉
 * @FilePath: \frontend\src\views\index-tts2\components\HistoryDrawer.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-drawer class="history-drawer" v-model="show" direction="ltr" size="75%" @open="onDrawerOpen">
		<template #header>
			<div class="history-drawer-header">
				<Icon class="history-drawer-header-icon" name="ri-history-line" size="20" />
				<h2 class="history-drawer-header-title">历史记录</h2>
			</div>
		</template>
		<div class="history-drawer-content" v-loading="loading">
			<template v-if="!loading">
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
							<td>{{ getFileNameFromPath(item?.input_config_raw.spk_audio_prompt) }}</td>
							<td>{{ getEmoControlMethodLabel(item.input_config_raw.emo_control_method) }}</td>
							<td>
								<el-text line-clamp="3">
									{{ item.input_config_raw.text }}
								</el-text>
							</td>
							<td>{{ getFileNameFromPath(item?.input_config_raw.emo_ref_path) }}</td>
							<td>
								<el-tag v-if="item.input_config_raw.isExpert" type="success">是</el-tag>
								<el-tag v-else type="info">否</el-tag>
							</td>
							<td>{{ formatDate(item.input_config_raw.createTime, "YYYY-MM-DD HH:mm:ss") }}</td>
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
			</template>
		</div>
		<template #footer>
			<el-button :disabled="loading" @click="onClear">清空</el-button>
		</template>
	</el-drawer>
	<el-dialog v-model="openDialog" title="详细配置" width="900" align-center @close="onDialogClose">
		<el-descriptions class="el-descriptions-vertical-top" :column="2" border label-width="170">
			<el-descriptions-item label="ID" :span="2">
				{{ viewData?.input_config_raw.id }}
			</el-descriptions-item>
			<el-descriptions-item label="创建时间" :span="2">
				{{ formatDate(viewData!.input_config_raw.createTime, "YYYY-MM-DD HH:mm:ss") }}
			</el-descriptions-item>
			<el-descriptions-item label="参考音频" :span="2">
				{{ getFileNameFromPath(viewData?.input_config_raw.spk_audio_prompt) }}
			</el-descriptions-item>
			<el-descriptions-item label="参考音频路径" :span="2">
				{{ viewData?.input_config_raw.spk_audio_prompt }}
			</el-descriptions-item>
			<el-descriptions-item label="情感控制方式" :span="2">
				{{ getEmoControlMethodLabel(viewData?.input_config_raw.emo_control_method) }}
			</el-descriptions-item>
			<el-descriptions-item label="情感参考音频" :span="2">
				{{ getFileNameFromPath(viewData?.input_config_raw.emo_ref_path) }}
			</el-descriptions-item>
			<el-descriptions-item label="情感参考音频路径" :span="2">
				{{ viewData?.input_config_raw.emo_ref_path }}
			</el-descriptions-item>
			<el-descriptions-item label="生成音频" :span="2">
				<div class="view-audio-wrapper">
					<audio ref="audioRef" class="view-audio" controls :src="audioPath"></audio>
					<el-button type="primary" @click="onDownloadAudio(viewData?.file_path)">下载</el-button>
				</div>
			</el-descriptions-item>
			<el-descriptions-item label="生成音频路径" :span="2">
				{{ viewData?.file_path }}
			</el-descriptions-item>
			<el-descriptions-item label="生成内容" :span="2">
				<div class="descriptions-text">
					{{ viewData?.input_config_raw.text }}
				</div>
			</el-descriptions-item>
			<el-descriptions-item label="文本分段最大Token">
				{{ viewData?.input_config_raw.max_text_tokens_per_segment }}
			</el-descriptions-item>
			<el-descriptions-item label="情感控制权重">
				{{ viewData?.input_config_raw.emo_weight }}
			</el-descriptions-item>
			<el-descriptions-item label="随机情绪采样">
				{{ viewData?.input_config_raw.emo_random }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-快乐">
				{{ viewData?.input_config_raw.vec1 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-生气">
				{{ viewData?.input_config_raw.vec2 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-难过">
				{{ viewData?.input_config_raw.vec3 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-害怕">
				{{ viewData?.input_config_raw.vec4 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-厌恶">
				{{ viewData?.input_config_raw.vec5 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-忧郁">
				{{ viewData?.input_config_raw.vec6 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-惊讶">
				{{ viewData?.input_config_raw.vec7 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-平静">
				{{ viewData?.input_config_raw.vec8 }}
			</el-descriptions-item>
			<el-descriptions-item label="情感描述">
				{{ viewData?.input_config_raw.prompt }}
			</el-descriptions-item>
			<el-descriptions-item label="启用 GPT-2 样本抽取">
				{{ viewData?.input_config_raw.do_sample }}
			</el-descriptions-item>
			<el-descriptions-item label="GPT-2 采样温度">
				{{ viewData?.input_config_raw.temperature }}
			</el-descriptions-item>
			<el-descriptions-item label="top_p">
				{{ viewData?.input_config_raw.top_p }}
			</el-descriptions-item>
			<el-descriptions-item label="top_k">
				{{ viewData?.input_config_raw.top_k }}
			</el-descriptions-item>
			<el-descriptions-item label="num_beams">
				{{ viewData?.input_config_raw.num_beams }}
			</el-descriptions-item>
			<el-descriptions-item label="重复惩罚">
				{{ viewData?.input_config_raw.repetition_penalty }}
			</el-descriptions-item>
			<el-descriptions-item label="长度惩罚">
				{{ viewData?.input_config_raw.length_penalty }}
			</el-descriptions-item>
			<el-descriptions-item label="最大生成令牌数">
				{{ viewData?.input_config_raw.max_mel_tokens }}
			</el-descriptions-item>
		</el-descriptions>
	</el-dialog>
</template>

<script setup lang="ts">
import { getEmoControlMethodLabel, getFileNameFromPath } from "../helper";
import type { HistoryItem } from "../types";
import { formatDate } from "@/utils/dayjs";
import { ttsHistory, ttsHistoryDelete } from "@/api/index-tts2";
import type { TTSHistoryResult } from "@/api/index-tts2";
import type { Simplify } from "type-fest";
import { getEnv } from "@/utils/env";
import { downloadFile } from "@/utils/tools";

export type TTSHistoryItem = Simplify<
	Omit<TTSHistoryResult["records"][number], "input_config_raw"> & { input_config_raw: HistoryItem }
>;
type HistoryData = Array<TTSHistoryItem>;

const emit = defineEmits<{
	/** 应用历史记录 */
	"apply-history": [item: TTSHistoryItem];
}>();

const env = getEnv();
const show = defineModel({ type: Boolean, required: true });
const loading = ref(false);
const historyData = ref<HistoryData>([]);
const openDialog = ref(false);
const viewData = ref<TTSHistoryItem>();
const audioPath = computed(() => {
	const filePath = viewData.value?.file_path;
	if (typeof filePath !== "string" || filePath.trim() === "") return "";
	return `${env.VITE_APP_API_BASE_URL}/audio/preview?filename=${encodeURIComponent(filePath)}`;
});
const audioRef = useTemplateRef("audioRef");

// api 获取历史记录
const getHistory = async () => {
	try {
		loading.value = true;

		const result = await ttsHistory();
		historyData.value = result.records.map((item) => {
			let input_config_raw: HistoryItem;
			try {
				input_config_raw = JSON.parse(item.input_config_raw);
			} catch {
				// @ts-expect-error fuck ts type
				input_config_raw = {};
			}

			return {
				id: item.id,
				history_path: item.history_path,
				status: item.status,
				input_config_raw: input_config_raw,
				file_path: item.file_path
			};
		});

		loading.value = false;
	} catch (error) {
		loading.value = false;

		console.error("获取历史记录失败", error);
	}
};

/** 查看 */
function onView(item: TTSHistoryItem) {
	viewData.value = item;
	openDialog.value = true;
}
/** 应用 */
function onApply(item: TTSHistoryItem) {
	show.value = false;
	emit("apply-history", toRaw(item));
}
/** 删除 */
async function onDelete(item: TTSHistoryItem) {
	try {
		loading.value = true;
		await ttsHistoryDelete({ path: item.history_path });

		// api
		getHistory();

		ElMessage.success("删除成功");
	} catch (error) {
		loading.value = false;

		console.error("删除历史记录失败", error);
	}
}

/** 清空 */
async function onClear() {
	try {
		loading.value = true;
		await ttsHistoryDelete({ all: true });

		// api
		getHistory();

		ElMessage.success("历史记录已清空");
	} catch (error) {
		loading.value = false;

		console.error("清空历史记录失败", error);
	}
}

/** 下载音频 */
function onDownloadAudio(path?: string) {
	if (typeof path !== "string" || path.trim() === "") return;
	const url = `${env.VITE_APP_API_BASE_URL}/tts/download?filepath=${encodeURIComponent(path)}`;
	downloadFile(url);
}

/** 打开弹窗 */
const onDrawerOpen = () => {
	getHistory();
};

/** 关闭dialog弹窗 */
function onDialogClose() {
	audioRef.value?.pause();
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
// .history-drawer-content {
// }
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
	font-size: var(--el-font-size-base);
	color: var(--el-text-color-primary);
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
	font-size: var(--el-font-size-base);
	color: var(--el-text-color-regular);
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
.descriptions-text {
	white-space: pre-wrap;
	max-height: 300px;
	overflow: auto;
}
.view-audio-wrapper {
	display: flex;
	align-items: center;
	gap: 12px;
}
.view-audio {
	flex-grow: 1;
	min-width: 0;
	height: 40px;
}
</style>
