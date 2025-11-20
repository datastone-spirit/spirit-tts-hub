<!--
 * @Author: mulingyuer
 * @Date: 2025-11-20 15:02:16
 * @LastEditTime: 2025-11-20 17:20:13
 * @LastEditors: mulingyuer
 * @Description: 角色名称弹窗
 * @FilePath: \frontend\src\views\index-tts2\components\Role\RoleNameDialog.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-dialog
		v-model="show"
		:title="title"
		width="600"
		align-center
		@open="onOpen"
		@closed="onClosed"
	>
		<el-form ref="ruleFormRef" :model="ruleForm" :rules="rules">
			<el-form-item label="角色名称" prop="name">
				<el-input v-model="ruleForm.name" />
			</el-form-item>
		</el-form>
		<template #footer>
			<div class="dialog-footer">
				<el-button @click="onCancel">取消</el-button>
				<el-button type="primary" @click="onConfirm"> 确认 </el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import type { BaseModalProps, BaseModalEmit } from "@/hooks/useModal";
import type { CreateRoleData } from "@/api/roles";
import type { FormInstance, FormRules } from "element-plus";
import { validateForm } from "@/utils/tools";

export type RuleForm = Pick<CreateRoleData, "name">;
export interface RoleNameDialogProps {
	/** 弹窗类型 */
	type?: "create" | "edit";
	/** 编辑的数据 */
	editData?: RuleForm;
}

const show = defineModel({ type: Boolean, required: true });
const props = withDefaults(defineProps<RoleNameDialogProps & BaseModalProps>(), {
	type: "create"
});
const emit = defineEmits<BaseModalEmit>();

const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive<RuleForm>({
	name: ""
});
const rules = reactive<FormRules<RuleForm>>({
	name: [
		{ required: true, message: "请输入角色名称", trigger: "blur" },
		{ min: 1, max: 25, message: "角色名长度1-25个字符", trigger: "blur" }
	]
});
const title = computed(() => {
	return props.type === "create" ? "创建角色" : "编辑角色";
});

const onCancel = () => {
	emit("cancel", new Error("用户取消了"));
};
const onConfirm = async () => {
	if (!ruleFormRef.value) return;
	const validResult = await validateForm(ruleFormRef.value);
	if (!validResult.isValid) return;

	emit("confirm", ruleForm);
};

const onOpen = () => {
	if (props.type === "edit") {
		ruleForm.name = props.editData?.name || "";
	} else {
		ruleForm.name = "";
	}
};
const onClosed = () => {
	if (ruleFormRef.value) {
		ruleFormRef.value.resetFields();
	}
};
</script>

<style scoped></style>
