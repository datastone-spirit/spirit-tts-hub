<!--
 * @Author: mulingyuer
 * @Date: 2025-10-22 16:00:10
 * @LastEditTime: 2025-11-20 10:41:29
 * @LastEditors: mulingyuer
 * @Description: 历史记录抽屉
 * @FilePath: \frontend\src\views\index-tts2\components\HistoryDrawer\index.vue
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
							<th>专家模式</th>
							<th>生成音频</th>
							<th>创建时间</th>
							<th>控制</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in historyData" :key="item.id">
							<td>
								{{ getFileNameFromPath(item?.input_config_raw.spk_audio_prompt) }}
								<AudioPlayerDownloader :url="item?.input_config_raw.spk_audio_prompt" />
							</td>
							<td>{{ getEmoControlMethodLabel(item.input_config_raw.emo_control_method) }}</td>
							<td>
								<el-text line-clamp="3">
									{{ item.input_config_raw.text }}
								</el-text>
							</td>
							<td>
								<el-tag v-if="item.input_config_raw.isExpert" type="success">是</el-tag>
								<el-tag v-else type="info">否</el-tag>
							</td>
							<td>
								{{ getFileNameFromPath(item?.file_path) }}
								<ElSpacePro :size="4">
									<AudioPlayerDownloader :url="item?.file_path" />
									<AudioDownload :url="item?.file_path" />
								</ElSpacePro>
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
</template>

<script setup lang="ts">
import { ttsHistory, ttsHistoryDelete } from "@/api/index-tts2";
import { useModal } from "@/hooks/useModal";
import { formatDate } from "@/utils/dayjs";
import { getFileNameFromPath } from "@/utils/tools";
import { getEmoControlMethodLabel } from "../../helper";
import type { HistoryData, HistoryItem, TTSHistoryItem } from "../../types";
import type { DetailDialogProps } from "./DetailDialog.vue";
import DetailDialog from "./DetailDialog.vue";

const emit = defineEmits<{
	/** 应用历史记录 */
	"apply-history": [item: TTSHistoryItem];
}>();

const show = defineModel({ type: Boolean, required: true });
const loading = ref(false);
const historyData = ref<HistoryData>([]);
const modal = useModal();

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
	const modelProps: DetailDialogProps = {
		viewData: item
	};
	modal
		.open({
			component: DetailDialog,
			props: modelProps
		})
		.catch(() => {});
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

/** 打开弹窗 */
const onDrawerOpen = () => {
	getHistory();
};

onMounted(() => {
	if (show.value) onDrawerOpen();
});
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
		padding-bottom: 10px;
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
.history-drawer-table .col-1 {
	width: 180px;
}
.history-drawer-table .col-2 {
	width: 180px;
}
.history-drawer-table .col-3 {
	width: 300px;
}
.history-drawer-table .col-4 {
	width: 80px;
}
.history-drawer-table .col-5 {
	width: 230px;
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
