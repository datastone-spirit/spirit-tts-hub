<!--
 * @Author: mulingyuer
 * @Date: 2025-10-16 11:38:31
 * @LastEditTime: 2025-10-20 15:15:07
 * @LastEditors: mulingyuer
 * @Description: 高级设置
 * @FilePath: \frontend\src\views\index-tts2\components\Advanced\index.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="advanced">
		<el-form
			class="zl-el-form-label-top"
			ref="ruleFormRef"
			:model="ruleForm"
			:rules="rules"
			label-position="top"
			label-suffix="："
			size="large"
		>
			<el-form-item>
				<el-alert type="info" :closable="false">
					GPT-2 采样配置影响生成音频的多样性和生成速度。更多详情请参阅
					<el-link
						type="info"
						href="https://huggingface.co/docs/transformers/main/en/generation_strategies"
						target="_blank"
						>生成策略 </el-link
					>。
				</el-alert>
			</el-form-item>
			<el-form-item label="启用 GPT-2 样本抽取" prop="do_sample">
				<el-switch v-model="ruleForm.do_sample" />
			</el-form-item>
			<el-form-item label="GPT-2 采样温度（temperature）" prop="temperature">
				<NumericRangeControl
					v-model="ruleForm.temperature"
					:min="0.1"
					:max="2"
					:step="0.1"
					:show-reset-text="false"
					:reset-default="0.8"
				/>
			</el-form-item>
			<el-form-item label="top_p" prop="top_p">
				<NumericRangeControl
					v-model="ruleForm.top_p"
					:min="0"
					:max="1"
					:step="0.01"
					:show-reset-text="false"
					:reset-default="0.8"
				/>
			</el-form-item>
			<el-form-item label="top_k" prop="top_k">
				<NumericRangeControl
					v-model="ruleForm.top_k"
					:min="0"
					:max="100"
					:step="1"
					:show-reset-text="false"
					:reset-default="30"
				/>
			</el-form-item>
			<el-form-item label="num_beams" prop="num_beams">
				<NumericRangeControl
					v-model="ruleForm.num_beams"
					:min="1"
					:max="10"
					:step="1"
					:show-reset-text="false"
					:reset-default="3"
				/>
			</el-form-item>
			<el-form-item label="重复惩罚（repetition_penalty）" prop="repetition_penalty">
				<el-input-number v-model="ruleForm.repetition_penalty" :step="0.1" :min="0" :max="20" />
			</el-form-item>
			<el-form-item label="长度惩罚（length_penalty）" prop="length_penalty">
				<el-input-number v-model="ruleForm.length_penalty" :step="0.1" :min="-2" :max="2" />
			</el-form-item>
			<el-form-item label="最大生成令牌数（max_mel_tokens）" prop="max_mel_tokens">
				<el-space fill style="width: 100%">
					<NumericRangeControl
						v-model="ruleForm.max_mel_tokens"
						:min="50"
						:max="1810"
						:step="10"
						:show-reset-text="false"
						:reset-default="1500"
					/>
					<el-alert type="info" :closable="false">
						最大生成令牌数。如果文本超过此数，音频将被截断。
					</el-alert>
				</el-space>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import type { RuleForm } from "../../types";

const ruleForm = defineModel("ruleForm", { type: Object as PropType<RuleForm>, required: true });
const ruleFormRef = useTemplateRef<FormInstance>("ruleFormRef");
const rules = reactive<FormRules<RuleForm>>({});
</script>

<style lang="scss" scoped>
.advanced {
	padding: 16px;
}
</style>
