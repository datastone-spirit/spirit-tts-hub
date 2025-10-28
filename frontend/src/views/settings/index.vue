<!--
 * @Author: mulingyuer
 * @Date: 2025-10-27 11:06:39
 * @LastEditTime: 2025-10-28 10:26:18
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
				<el-form-item class="rule-form-item" label="文件上传保存路径" prop="uploadPath">
					<FolderPicker v-model="ruleForm.uploadPath" />
				</el-form-item>
				<el-form-item class="rule-form-item" label="文件生成保存路径" prop="outputPath">
					<FolderPicker v-model="ruleForm.outputPath" />
				</el-form-item>
			</el-form>
		</BaseCard>
		<template #footer>
			<div class="settings-footer">
				<el-button @click="onReset">重置设置</el-button>
			</div>
		</template>
	</BasePage>
</template>

<script setup lang="ts">
import { useSettingsStore, type AppSettings } from "@/stores";
import type { FormInstance, FormRules } from "element-plus";
import { getEnv } from "@/utils/env";
import { getFileInfo, type DirectoryResult } from "@/api/common";

const settingsStore = useSettingsStore();

const env = getEnv();
const ruleFormRef = ref<FormInstance>();
const ruleForm = storeToRefs(settingsStore).appSettings;
const rules = reactive<FormRules<AppSettings>>({
	uploadPath: [
		{
			trigger: "change",
			validator: (_rule, value: string, callback) => {
				// 小白校验
				if (settingsStore.whiteCheck && !value.startsWith(env.VITE_APP_OUTPUT_PARENT_PATH)) {
					return callback(new Error(`请选择以${env.VITE_APP_OUTPUT_PARENT_PATH}路径开头的目录`));
				}

				callback();
			}
		},
		{
			trigger: "blur",
			validator: async (_rule, value: string, callback) => {
				try {
					const result = await getFileInfo(value);

					if (!result || (result as any).error) {
						return callback(new Error("路径不正确，请输入正确的路径"));
					}

					if (result.dirname === value) {
						return callback();
					}

					const findFolder = result.files.find((item): item is DirectoryResult => {
						return item.path === value && item.type === "dir";
					});
					if (!findFolder) {
						return callback(new Error("目录不存在"));
					}

					callback();
				} catch (error) {
					console.error("获取目录信息发生错误：", error);
					return callback(new Error("获取目录信息发生错误"));
				}
			}
		}
	],
	outputPath: [
		{
			trigger: "change",
			validator: (_rule, value: string, callback) => {
				// 小白校验
				if (settingsStore.whiteCheck && !value.startsWith(env.VITE_APP_OUTPUT_PARENT_PATH)) {
					return callback(new Error(`请选择以${env.VITE_APP_OUTPUT_PARENT_PATH}路径开头的目录`));
				}

				callback();
			}
		},
		{
			trigger: "blur",
			validator: async (_rule, value: string, callback) => {
				try {
					const result = await getFileInfo(value);
					if (!result || (result as any).error) {
						return callback(new Error("路径不正确，请输入正确的路径"));
					}

					if (result.dirname === value) {
						return callback();
					}

					const findFolder = result.files.find((item): item is DirectoryResult => {
						return item.path === value && item.type === "dir";
					});
					if (!findFolder) {
						return callback(new Error("目录不存在"));
					}

					callback();
				} catch (error) {
					console.error("获取目录信息发生错误：", error);
					return callback(new Error("获取目录信息发生错误"));
				}
			}
		}
	]
});

/** 重置设置 */
function onReset() {
	ruleFormRef.value?.resetFields();
	settingsStore.resetAppSettings();

	ElMessage.success("重置设置成功");
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
