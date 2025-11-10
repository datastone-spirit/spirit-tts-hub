<!--
 * @Author: mulingyuer
 * @Date: 2025-10-27 11:06:39
 * @LastEditTime: 2025-11-10 14:49:25
 * @LastEditors: mulingyuer
 * @Description: 设置页面
 * @FilePath: \frontend\src\views\settings\index.vue
 * 怎么可能会有bug！！！
-->
<template>
	<BasePage class="settings" title="设置" v-loading="loading">
		<BaseCard title="输入输出配置">
			<el-form
				class="rule-form"
				ref="ruleFormRef"
				:model="ruleForm"
				:rules="rules"
				label-suffix="："
			>
				<el-form-item class="rule-form-item" label="文件上传保存路径" prop="upload_path">
					<FolderPicker v-model="ruleForm.upload_path" />
				</el-form-item>
				<el-form-item class="rule-form-item" label="文件生成保存路径" prop="output_path">
					<FolderPicker v-model="ruleForm.output_path" />
				</el-form-item>
			</el-form>
		</BaseCard>
		<template #footer>
			<div class="settings-footer">
				<el-button @click="onReset">重置</el-button>
				<el-button type="primary" @click="onSave"> 保存 </el-button>
			</div>
		</template>
	</BasePage>
</template>

<script setup lang="ts">
import { checkDirectoryExists } from "@/api/common";
import type { ConfigResult } from "@/api/config";
import { getConfig, resetConfig, updateConfig } from "@/api/config";
import { useSettingsStore } from "@/stores";
import { getEnv } from "@/utils/env";
import { validateForm } from "@/utils/tools";
import type { FormInstance, FormRules } from "element-plus";

type DirExistResult = { valid: true } | { valid: false; message: string };

const settingsStore = useSettingsStore();

const env = getEnv();
const ruleFormRef = ref<FormInstance>();
const ruleForm = storeToRefs(settingsStore).appSettings;
const rules = reactive<FormRules<ConfigResult>>({
	upload_path: [
		{
			trigger: "blur",
			asyncValidator: async (_rule, value: string, callback) => {
				try {
					// 小白校验
					if (settingsStore.whiteCheck && !value.startsWith(env.VITE_APP_OUTPUT_PARENT_PATH)) {
						callback(new Error(`请选择以${env.VITE_APP_OUTPUT_PARENT_PATH}路径开头的目录`));
						return;
					}

					// 判断目录是否存在
					const result = await isDirExist(value);
					if (!result.valid) {
						callback(new Error(result.message));
						return;
					}

					callback();
				} catch (error) {
					console.error("获取目录信息发生错误：", error);
					callback(new Error("获取目录信息发生错误"));
				}
			}
		}
	],
	output_path: [
		{
			trigger: "blur",
			asyncValidator: async (_rule, value: string, callback) => {
				try {
					// 小白校验
					if (settingsStore.whiteCheck && !value.startsWith(env.VITE_APP_OUTPUT_PARENT_PATH)) {
						callback(new Error(`请选择以${env.VITE_APP_OUTPUT_PARENT_PATH}路径开头的目录`));
						return;
					}

					// 判断目录是否存在
					const result = await isDirExist(value);
					if (!result.valid) {
						callback(new Error(result.message));
						return;
					}

					callback();
				} catch (error) {
					console.error("获取目录信息发生错误：", error);
					callback(new Error("获取目录信息发生错误"));
				}
			}
		}
	]
});
const loading = ref(false);

/** 判断目录是否存在 */
async function isDirExist(path: string): Promise<DirExistResult> {
	const result = await checkDirectoryExists({ path });

	if (!result || !result.exists) {
		return { valid: false, message: "目录不存在，请输入正确的路径" };
	}

	return { valid: true };
}

/** 或者配置 */
async function getSettings() {
	try {
		loading.value = true;
		const result = await getConfig();
		settingsStore.updateAppSettings(result);
		loading.value = false;
	} catch (error) {
		loading.value = false;
		console.error("获取配置失败：", error);
	}
}

/** 保存 */
async function onSave() {
	try {
		if (!ruleFormRef.value) return;
		const validResult = await validateForm(ruleFormRef.value);
		if (!validResult.isValid) return;

		loading.value = true;

		await updateConfig(ruleForm.value);
		await getSettings();

		loading.value = false;
		ElMessage.success("保存成功");
	} catch (error) {
		loading.value = false;

		console.error("保存失败：", error);
	}
}

/** 重置设置 */
async function onReset() {
	try {
		loading.value = true;

		await resetConfig();
		await getSettings();

		loading.value = false;

		ElMessage.success("重置成功");
	} catch (error) {
		loading.value = false;

		console.error("重置失败：", error);
	}
}

onMounted(() => {
	getSettings();
});
</script>

<style lang="scss" scoped>
.rule-form-item {
	max-width: 600px;
}
.settings-footer {
	text-align: right;
}
</style>
