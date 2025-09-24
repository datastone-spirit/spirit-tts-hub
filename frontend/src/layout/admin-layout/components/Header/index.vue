<!--
 * @Author: mulingyuer
 * @Date: 2025-09-24 09:32:10
 * @LastEditTime: 2025-09-24 09:53:46
 * @LastEditors: mulingyuer
 * @Description: header
 * @FilePath: \frontend\src\layout\admin-layout\components\Header\index.vue
 * 怎么可能会有bug！！！
-->
<template>
	<el-header class="header" :class="[headerClass]">
		<div class="header-left"></div>
		<div class="header-right">
			<el-space class="header-right-space" :size="10">
				<LightDarkToggle />
				<router-link class="help-btn" :to="{ name: 'Help' }">
					<Icon name="ri-question-line" />
					<span>帮助</span>
				</router-link>
			</el-space>
		</div>
	</el-header>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores";
import LightDarkToggle from "./LightDarkToggle.vue";

const appStore = useAppStore();
const headerClass = computed(() => {
	if (appStore.isMobile) {
		// 移动端
		return appStore.isCollapse ? "is-mobile-collapse" : "is-mobile";
	} else {
		return appStore.isCollapse ? "is-collapse" : "";
	}
});
</script>

<style lang="scss" scoped>
.header {
	height: $zl-header-height;
	display: flex;
	padding: 0;
	padding-left: $zl-aside-width;
	transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	&.is-mobile-collapse,
	&.is-mobile {
		padding-left: $zl-aside-mobile-width;
	}
	&.is-collapse {
		padding-left: $zl-aside-mini-width;
	}
}
.header-left {
	flex-grow: 1;
	min-width: 0;
	padding-left: $zl-padding;
}
.header-right {
	flex-shrink: 0;
	padding-right: $zl-padding;
}
.header-right-space {
	height: 100%;
}
.help-btn {
	display: flex;
	align-items: center;
	gap: 6px;
	text-decoration: none;
	padding: 0 6px;
	color: var(--el-text-color-regular);
	transition: color var(--el-transition-duration);
	&:hover {
		color: var(--el-color-primary);
	}
	&:active {
		opacity: 0.7;
	}
}
</style>
