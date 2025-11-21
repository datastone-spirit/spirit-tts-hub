<!--
 * @Author: mulingyuer
 * @Date: 2025-11-20 16:34:39
 * @LastEditTime: 2025-11-20 16:48:00
 * @LastEditors: mulingyuer
 * @Description: 角色详情弹窗
 * @FilePath: \frontend\src\views\index-tts2\components\Role\RoleDetailDialog.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-dialog v-model="show" title="角色详情" width="900" align-center>
		<el-descriptions class="el-descriptions-vertical-top" :column="2" border label-width="170">
			<el-descriptions-item label="名称" :span="2">
				{{ viewData.name }}
			</el-descriptions-item>
			<el-descriptions-item label="ID">
				{{ viewData.id }}
			</el-descriptions-item>
			<el-descriptions-item label="创建时间">
				{{ formatDate(viewData.created_at * 1000, "YYYY-MM-DD HH:mm:ss") }}
			</el-descriptions-item>
			<el-descriptions-item label="参考音频" :span="2">
				{{ getFileNameFromPath(viewData.config.spk_audio_prompt) }}
				<AudioPlayerDownloader :url="viewData.config.spk_audio_prompt" />
			</el-descriptions-item>
			<el-descriptions-item label="参考音频路径" :span="2">
				{{ viewData.config.spk_audio_prompt }}
			</el-descriptions-item>
			<el-descriptions-item label="情感控制方式" :span="2">
				{{ getEmoControlMethodLabel(viewData.config.emo_control_method) }}
			</el-descriptions-item>
			<el-descriptions-item label="情感参考音频" :span="2">
				{{ getFileNameFromPath(viewData.config.emo_ref_path) }}
				<AudioPlayerDownloader
					v-if="!isEmptyString(viewData.config.emo_ref_path)"
					:url="viewData.config.emo_ref_path"
				/>
			</el-descriptions-item>
			<el-descriptions-item label="情感参考音频路径" :span="2">
				{{ viewData.config.emo_ref_path }}
			</el-descriptions-item>
			<el-descriptions-item label="文本分段最大Token">
				{{ viewData.config.max_text_tokens_per_segment }}
			</el-descriptions-item>
			<el-descriptions-item label="情感控制权重">
				{{ viewData.config.emo_weight }}
			</el-descriptions-item>
			<el-descriptions-item label="随机情绪采样">
				{{ viewData.config.emo_random }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-快乐">
				{{ viewData.config.vec1 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-生气">
				{{ viewData.config.vec2 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-难过">
				{{ viewData.config.vec3 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-害怕">
				{{ viewData.config.vec4 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-厌恶">
				{{ viewData.config.vec5 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-忧郁">
				{{ viewData.config.vec6 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-惊讶">
				{{ viewData.config.vec7 }}
			</el-descriptions-item>
			<el-descriptions-item label="情绪权重-平静">
				{{ viewData.config.vec8 }}
			</el-descriptions-item>
			<el-descriptions-item label="情感描述">
				{{ viewData.config.prompt }}
			</el-descriptions-item>
			<el-descriptions-item label="启用 GPT-2 样本抽取">
				{{ viewData.config.do_sample }}
			</el-descriptions-item>
			<el-descriptions-item label="GPT-2 采样温度">
				{{ viewData.config.temperature }}
			</el-descriptions-item>
			<el-descriptions-item label="top_p">
				{{ viewData.config.top_p }}
			</el-descriptions-item>
			<el-descriptions-item label="top_k">
				{{ viewData.config.top_k }}
			</el-descriptions-item>
			<el-descriptions-item label="num_beams">
				{{ viewData.config.num_beams }}
			</el-descriptions-item>
			<el-descriptions-item label="重复惩罚">
				{{ viewData.config.repetition_penalty }}
			</el-descriptions-item>
			<el-descriptions-item label="长度惩罚">
				{{ viewData.config.length_penalty }}
			</el-descriptions-item>
			<el-descriptions-item label="最大生成令牌数">
				{{ viewData.config.max_mel_tokens }}
			</el-descriptions-item>
		</el-descriptions>
	</el-dialog>
</template>

<script setup lang="ts">
import type { RoleData } from "../../types";
import { getEmoControlMethodLabel } from "../../helper";
import { getFileNameFromPath, isEmptyString } from "@/utils/tools";
import { formatDate } from "@/utils/dayjs";
import type { BaseModalProps } from "@/hooks/useModal";

export interface DetailDialogProps {
	/** 详情数据 */
	viewData: RoleData[number];
}

const show = defineModel({ type: Boolean, required: true });
const _props = defineProps<DetailDialogProps & BaseModalProps>();
</script>

<style scoped></style>
