<!--
 * @Author: mulingyuer
 * @Date: 2025-11-20 11:23:19
 * @LastEditTime: 2025-11-20 17:25:30
 * @LastEditors: mulingyuer
 * @Description: 角色抽屉
 * @FilePath: \frontend\src\views\index-tts2\components\Role\RoleDrawer.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-drawer class="role-drawer" v-model="show" direction="ltr" size="80%" @open="onDrawerOpen">
		<template #header>
			<div class="role-drawer-header">
				<Icon class="role-drawer-header-icon" name="ri-user-star-line" size="20" />
				<h2 class="role-drawer-header-title">角色</h2>
			</div>
		</template>
		<div class="role-drawer-content" v-loading="loading">
			<el-table :data="tableData" border style="width: 100%" size="default">
				<el-table-column prop="name" label="角色名称" min-width="100" />
				<el-table-column prop="config.spk_audio_prompt" label="参考音频" min-width="180">
					<template #default="{ row }">
						{{ getFileNameFromPath(row.config.spk_audio_prompt) }}
						<AudioPlayerDownloader :url="row.config.spk_audio_prompt" />
					</template>
				</el-table-column>
				<el-table-column prop="config.emo_control_method" label="情感控制方式" min-width="180">
					<template #default="{ row }">
						{{ getEmoControlMethodLabel(row.config.emo_control_method) }}
					</template>
				</el-table-column>
				<el-table-column prop="name" label="情感参考音频" min-width="180">
					<template #default="{ row }">
						{{ getFileNameFromPath(row.config.emo_ref_path) }}
						<AudioPlayerDownloader
							v-if="!isEmptyString(row.config.emo_ref_path)"
							:url="row.config.emo_ref_path"
						/>
					</template>
				</el-table-column>
				<el-table-column prop="name" label="专家模式" min-width="80">
					<template #default="{ row }">
						<el-tag v-if="row.config.isExpert" type="success">是</el-tag>
						<el-tag v-else type="info">否</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="name" label="创建时间" min-width="160">
					<template #default="{ row }">
						{{ formatDate(row.created_at * 1000, "YYYY-MM-DD HH:mm:ss") }}
					</template>
				</el-table-column>
				<el-table-column label="控制" min-width="260">
					<template #default="{ row }">
						<ElSpacePro>
							<el-button @click="onEdit(row)"> 重命名 </el-button>
							<el-button @click="onView(row)"> 查看 </el-button>
							<el-button @click="onApply(row)"> 应用 </el-button>
							<el-button type="danger" plain @click="onDelete(row)"> 删除 </el-button>
						</ElSpacePro>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<template #footer>
			<el-button :disabled="loading" @click="onClear">清空</el-button>
		</template>
	</el-drawer>
</template>

<script setup lang="ts">
import { getRoleList, deleteRole, clearAllRoles, updateRole } from "@/api/roles";
import { formatDate } from "@/utils/dayjs";
import { getFileNameFromPath, isEmptyString } from "@/utils/tools";
import { getEmoControlMethodLabel } from "../../helper";
import type { RoleData } from "../../types";
import RoleDetailDialog from "./RoleDetailDialog.vue";
import type { DetailDialogProps } from "./RoleDetailDialog.vue";
import { useModal } from "@/hooks/useModal";
import RoleNameDialog from "./RoleNameDialog.vue";
import type { RoleNameDialogProps, RuleForm as RoleNameDialogForm } from "./RoleNameDialog.vue";

const show = defineModel({ type: Boolean, required: true });
const emit = defineEmits<{
	/** 应用角色 */
	applyRole: [item: any];
}>();

const loading = ref(false);
const tableData = ref<RoleData>([]);
const modal = useModal();

// api 获取角色列表
const getList = async () => {
	try {
		loading.value = true;

		const result = await getRoleList();
		tableData.value = result.roles.map((item) => {
			return {
				id: item.id,
				name: item.name,
				created_at: item.created_at,
				config: JSON.parse(item.config)
			};
		});

		loading.value = false;
	} catch (error) {
		loading.value = false;

		console.error("获取历史记录失败", error);
	}
};

/** 编辑角色 */
const onEdit = async (item: RoleData[number]) => {
	try {
		if (!item) return;

		const modalProps: RoleNameDialogProps = {
			type: "edit",
			editData: {
				name: item.name
			}
		};
		const roleNameDialogForm: RoleNameDialogForm = await modal
			.open({
				component: RoleNameDialog,
				props: modalProps,
				persistent: true
			})
			.catch(() => null);
		if (!roleNameDialogForm) {
			loading.value = false;
			return;
		}

		loading.value = true;

		// api
		await updateRole({
			id: item.id,
			name: roleNameDialogForm.name,
			config: JSON.stringify(item.config)
		});
		getList();

		ElMessage.success("更新角色名称成功");
	} catch (error) {
		const message = `更新角色名称失败：${(error as Error)?.message ?? "未知错误"}`;

		loading.value = false;
		ElMessage.error(message);

		console.error(message, error);
	}
};

/** 查看角色详情 */
const onView = (item: RoleData[number]) => {
	if (!item) return;
	const modalProps: DetailDialogProps = {
		viewData: item
	};

	modal
		.open({
			component: RoleDetailDialog,
			props: modalProps,
			persistent: true
		})
		.catch(() => {});
};

/** 应用角色 */
const onApply = (item: RoleData[number]) => {
	emit("applyRole", item);
	show.value = false;
};

/** 删除角色 */
const onDelete = async (item: RoleData[number]) => {
	try {
		if (!item) return;

		loading.value = true;
		await deleteRole({ id: item.id });
		getList();

		ElMessage.success("删除成功");
	} catch (error) {
		loading.value = false;

		console.error("删除角色失败", error);
	}
};

/** 清空 */
const onClear = async () => {
	try {
		loading.value = true;
		await clearAllRoles();
		getList();

		ElMessage.success("清空成功");
	} catch (error) {
		loading.value = false;

		console.error("清空失败", error);
	}
};

/** 打开弹窗 */
const onDrawerOpen = () => {
	getList();
};

onMounted(() => {
	if (show.value) onDrawerOpen();
});
</script>

<style lang="scss">
.role-drawer {
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
.role-drawer-header {
	display: flex;
	align-items: center;
}
.role-drawer-header-icon {
	color: var(--el-color-primary);
	margin-right: $zl-padding;
}
.role-drawer-header-title {
	font-size: 16px;
	font-weight: bold;
	color: var(--el-text-color-primary);
}
</style>
