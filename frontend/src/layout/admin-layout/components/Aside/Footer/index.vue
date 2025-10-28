<!--
 * @Author: mulingyuer
 * @Date: 2024-12-11 16:13:18
 * @LastEditTime: 2025-10-27 11:11:10
 * @LastEditors: mulingyuer
 * @Description: 底部
 * @FilePath: \frontend\src\layout\admin-layout\components\Aside\Footer\index.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="aside-footer">
		<div class="aside-footer-content">
			<div class="aside-footer-content-left">
				<SettingsMenu />
			</div>
			<div class="aside-footer-content-right">
				<MenuCollapse />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import MenuCollapse from "./MenuCollapse.vue";
import SettingsMenu from "./SettingsMenu.vue";
</script>

<style lang="scss" scoped>
.aside-footer {
	position: relative;
	box-shadow: 0px 0px 12px var(--zl-aside-footer-box-shadow);
}
.aside-footer-content {
	display: flex;
	flex-wrap: wrap;
	padding: 6px 0;
}
.aside-footer-content-left,
.aside-footer-content-right {
	padding: 2px 12.5px;
}
.aside-footer-content-right {
	margin-left: auto;
}
</style>
