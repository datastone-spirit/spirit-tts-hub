<!--
 * @Author: mulingyuer
 * @Date: 2025-10-15 16:04:18
 * @LastEditTime: 2025-10-16 11:43:05
 * @LastEditors: mulingyuer
 * @Description: tts输入框
 * @FilePath: \frontend\src\views\index-tts2\components\TTSInput.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="tts-input">
		<el-form ref="ruleFormRef" :model="ruleForm" :rules="rules">
			<el-form-item prop="text">
				<el-input
					v-model="ruleForm.text"
					type="textarea"
					placeholder="请输入要合成的文本"
					:rows="10"
				/>
			</el-form-item>
			<el-form-item>
				<el-button
					class="tts-input-submit"
					type="primary"
					:icon="RiMusicAiFill"
					:loading="loading"
					@click="onSubmit"
				>
					生成语音
				</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";
import { validateForm } from "@/utils/tools";
import type { FormInstance, FormRules } from "element-plus";

export interface AudioRecorderProps {
	/** loading */
	loading: boolean;
}

interface RuleForm {
	text: string;
}

defineProps<AudioRecorderProps>();
const emit = defineEmits<{
	/** 确认生成 */
	confirm: [text: string];
}>();

// icon
const RiMusicAiFill = useIcon({ name: "ri-music-ai-fill", size: 14 });

const ruleFormRef = useTemplateRef<FormInstance>("ruleFormRef");
const ruleForm = reactive<RuleForm>({
	text: ""
});
const rules = reactive<FormRules<RuleForm>>({
	text: [
		{ required: true, message: "请输入要合成的文本", trigger: "blur" },
		{
			trigger: "blur",
			validator: (_rule, value, callback) => {
				if (typeof value !== "string" || value.trim() === "") {
					return callback(new Error("请输入要合成的文本，且不能为空字符"));
				}

				callback();
			}
		}
	]
});

/** 提交表单 */
async function onSubmit() {
	// 验证表单
	if (!ruleFormRef.value) return;
	const validResult = await validateForm(ruleFormRef.value);
	if (!validResult) return;

	// 事件
	emit("confirm", ruleForm.text);
}
</script>

<style lang="scss" scoped>
.tts-input {
	width: 100%;
}
.tts-input-submit {
	width: 100%;
	height: 38px;
}
</style>
