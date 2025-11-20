<!--
 * @Author: mulingyuer
 * @Date: 2025-11-20 09:32:55
 * @LastEditTime: 2025-11-20 09:40:02
 * @LastEditors: mulingyuer
 * @Description: 详情弹窗
 * @FilePath: \frontend\src\views\index-tts2\components\HistoryDrawer\DetailDialog.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-dialog v-model="show" title="详细配置" width="900" align-center>
		<el-descriptions class="el-descriptions-vertical-top" :column="2" border label-width="170">
			<el-descriptions-item label="ID" :span="2">
				{{ viewData?.input_config_raw.id }}
			</el-descriptions-item>
			<el-descriptions-item label="创建时间" :span="2">
				{{ formatDate(viewData!.input_config_raw.createTime, "YYYY-MM-DD HH:mm:ss") }}
			</el-descriptions-item>
			<el-descriptions-item label="参考音频" :span="2">
				{{ getFileNameFromPath(viewData?.input_config_raw.spk_audio_prompt) }}
				<AudioPlayerDownloader :url="viewData?.input_config_raw.spk_audio_prompt" />
			</el-descriptions-item>
			<el-descriptions-item label="参考音频路径" :span="2">
				{{ viewData?.input_config_raw.spk_audio_prompt }}
			</el-descriptions-item>
			<el-descriptions-item label="情感控制方式" :span="2">
				{{ getEmoControlMethodLabel(viewData?.input_config_raw.emo_control_method) }}
			</el-descriptions-item>
			<el-descriptions-item label="情感参考音频" :span="2">
				{{ getFileNameFromPath(viewData?.input_config_raw.emo_ref_path) }}
				<AudioPlayerDownloader
					v-if="!isEmptyString(viewData?.input_config_raw.emo_ref_path)"
					:url="viewData?.input_config_raw.emo_ref_path"
				/>
			</el-descriptions-item>
			<el-descriptions-item label="情感参考音频路径" :span="2">
				{{ viewData?.input_config_raw.emo_ref_path }}
			</el-descriptions-item>
			<el-descriptions-item label="生成音频" :span="2">
				{{ getFileNameFromPath(viewData?.file_path) }}
				<ElSpacePro :size="4">
					<AudioPlayerDownloader :url="viewData?.file_path" />
					<AudioDownload :url="viewData?.file_path" />
				</ElSpacePro>
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
import type { TTSHistoryItem } from "../../types";
import { getEmoControlMethodLabel } from "../../helper";
import { getFileNameFromPath, isEmptyString } from "@/utils/tools";
import { formatDate } from "@/utils/dayjs";

export interface DetailDialogProps {
	/** 详情数据 */
	viewData: TTSHistoryItem;
}

const show = defineModel({ type: Boolean, required: true });
const _props = defineProps<DetailDialogProps>();
</script>

<style scoped></style>
