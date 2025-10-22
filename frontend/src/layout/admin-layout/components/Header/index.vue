<!--
 * @Author: mulingyuer
 * @Date: 2025-09-24 09:32:10
 * @LastEditTime: 2025-10-22 15:40:54
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
				<ZLSwitch v-model="openComplexity" off-text="新手" on-text="专家" />
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
import { useAppStore, useSettingsStore } from "@/stores";
import LightDarkToggle from "./LightDarkToggle.vue";
import { ComplexityEnum } from "@/enums/complexity.enum";

const appStore = useAppStore();
const settingsStore = useSettingsStore();

const headerClass = computed(() => {
	if (appStore.isMobile) {
		// 移动端
		return appStore.isCollapse ? "is-mobile-collapse" : "is-mobile";
	} else {
		return appStore.isCollapse ? "is-collapse" : "";
	}
});

/** 难度切换 */
const openComplexity = computed({
	get() {
		return settingsStore.isExpert;
	},
	set(val: boolean) {
		settingsStore.setComplexity(val ? ComplexityEnum.EXPERT : ComplexityEnum.BEGINNER);
	}
});
</script>

<style lang="scss" scoped>
.header {
	position: fixed;
	top: 0;
	right: 0;
	left: $zl-aside-width;
	height: $zl-header-height;
	background-color: var(--zl-bg);
	display: flex;
	padding: 0;
	transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	&.is-mobile-collapse,
	&.is-mobile {
		left: $zl-aside-mobile-width;
	}
	&.is-collapse {
		left: $zl-aside-mini-width;
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
	@include no-select();
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
