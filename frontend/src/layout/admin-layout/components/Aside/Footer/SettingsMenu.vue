<!--
 * @Author: mulingyuer
 * @Date: 2025-10-27 11:10:47
 * @LastEditTime: 2025-10-27 11:12:27
 * @LastEditors: mulingyuer
 * @Description: 设置按钮
 * @FilePath: \frontend\src\layout\admin-layout\components\Aside\Footer\SettingsMenu.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-button
		class="settings-menu-btn"
		:icon="RiSettings_3Line"
		circle
		text
		size="large"
		@click="toggleSettingsMenu"
	/>
</template>

<script setup lang="ts">
import { useIcon } from "@/hooks/useIcon";

const router = useRouter();

// icon
const RiSettings_3Line = useIcon({ name: "ri-settings-3-line", size: 20 });

function toggleSettingsMenu() {
	router.push({ name: "Settings" });
}
</script>

<style scoped></style>
