<!--
 * @Author: mulingyuer
 * @Date: 2025-10-27 11:06:39
 * @LastEditTime: 2025-11-07 12:51:23
 * @LastEditors: mulingyuer
 * @Description: 设置页面
 * @FilePath: \frontend\src\views\settings\index.vue
 * 怎么可能会有bug！！！
-->
<template>
	<BasePage class="settings" title="设置">
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
				<el-button :loading="resetLoading" :disabled="loading" @click="onReset">重置</el-button>
				<el-button type="primary" :loading="loading" :disabled="resetLoading" @click="onSave">
					保存
				</el-button>
			</div>
		</template>
	</BasePage>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/stores";
import type { FormInstance, FormRules } from "element-plus";
import { getEnv } from "@/utils/env";
import { getFileInfo, type DirectoryResult } from "@/api/common";
import type { ConfigResult } from "@/api/config";
import { updateConfig, getConfig, resetConfig } from "@/api/config";
import { validateForm } from "@/utils/tools";

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
const resetLoading = ref(false);

/** 判断目录是否存在 */
async function isDirExist(path: string): Promise<DirExistResult> {
	const result = await getFileInfo(path);

	if (!result || (result as any).error) {
		return { valid: false, message: "路径不正确，请输入正确的路径" };
	}

	if (result.dirname === path) {
		return { valid: true };
	}

	const findFolder = result.files.find((item): item is DirectoryResult => {
		return item.path === path && item.type === "dir";
	});
	if (!findFolder) {
		return { valid: false, message: "目录不存在" };
	}

	return { valid: true };
}

/** 保存 */
async function onSave() {
	try {
		if (!ruleFormRef.value) return;

		loading.value = true;
		const validResult = await validateForm(ruleFormRef.value);
		if (!validResult.isValid) {
			loading.value = false;
			return;
		}

		await updateConfig(ruleForm.value);

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
		resetLoading.value = true;

		await resetConfig();
		const result = await getConfig();
		settingsStore.updateAppSettings(result);

		resetLoading.value = false;
	} catch (error) {
		resetLoading.value = false;

		console.error("重置设置失败：", error);
	}
	// ruleFormRef.value?.resetFields();
	// settingsStore.resetAppSettings();
	// ElMessage.success("重置设置成功");
}
</script>

<style lang="scss" scoped>
.rule-form-item {
	max-width: 600px;
}
.settings-footer {
	text-align: right;
}
</style>
