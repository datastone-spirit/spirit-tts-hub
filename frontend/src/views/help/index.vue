<!--
 * @Author: mulingyuer
 * @Date: 2025-09-24 09:51:09
 * @LastEditTime: 2025-10-23 10:41:06
 * @LastEditors: mulingyuer
 * @Description: 帮助页面
 * @FilePath: \frontend\src\views\help\index.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="help">
		<div class="help-head">
			<h2 class="help-title">帮助</h2>
		</div>
		<el-divider class="help-divider no-margin" />
		<div class="help-body">
			<HelpCard :title="logoTitle">
				<div class="help-item">
					<div class="help-item-label">简介</div>
					<div class="help-item-value">这是一个由智灵算力平台开源的 TTS 音频合成平台。</div>
				</div>
				<div class="help-item">
					<div class="help-item-label">最后更新时间</div>
					<div class="help-item-value">{{ commitTime }}</div>
				</div>
				<div class="help-item">
					<div class="help-item-label">哈希</div>
					<div class="help-item-value">{{ commitId }}</div>
				</div>
			</HelpCard>
			<el-divider class="help-divider" />
			<HelpCard title="资源一览">
				<ElSpacePro :size="24" direction="vertical">
					<a
						class="help-link"
						href="https://github.com/datastone-spirit/spirit-tts-hub"
						target="_blank"
					>
						<Icon name="ri-github-fill" :size="20" />
						<span>{{ logoTitle }}</span>
					</a>
					<a class="help-link" href="https://serverless.datastone.cn/" target="_blank">
						<Icon name="ri-window-2-fill" :size="20" />
						<span>进入智灵官网</span>
					</a>
					<a class="help-link" href="https://serverless.datastone.cn/sprite/app/" target="_blank">
						<Icon name="ri-tools-fill" :size="20" />
						<span>进入智灵后台</span>
					</a>
					<a
						class="help-link"
						href="https://serverless.datastone.cn/sprite/docs/zh/"
						target="_blank"
					>
						<Icon name="ri-booklet-fill" :size="20" />
						<span>查看使用手册</span>
					</a>
				</ElSpacePro>
			</HelpCard>
			<el-divider class="help-divider" />
			<HelpCard title="视频教程">
				<ElSpacePro :size="24" direction="vertical">
					<a class="help-link" href="https://www.bilibili.com/video/BV1VW61YxE5N" target="_blank">
						<Icon name="ri-movie-fill" :size="20" />
						<span>查看 智灵TTS HUB 使用教程</span>
					</a>
				</ElSpacePro>
			</HelpCard>
		</div>
	</div>
</template>

<script setup lang="ts">
import { formatDate } from "@/utils/dayjs";
import HelpCard from "./components/HelpCard.vue";

const logoTitle = import.meta.env.VITE_APP_TITLE;
const commitTime = formatDate(__GIT_COMMIT_TIME__, "YYYY/MM/DD HH:mm:ss");
const commitId = __GIT_COMMIT_ID__;
</script>

<style lang="scss" scoped>
.help-head {
	padding: 0 $zl-padding * 2;
	height: 48px;
	display: flex;
	align-items: center;
}
.help-title {
	flex-shrink: 0;
	font-size: 16px;
	line-height: 22px;
	font-weight: bold;
	color: var(--el-text-color-primary);
}
.help-divider {
	margin-bottom: 0;
	&.no-margin {
		margin: 0px;
	}
}
.help-body {
	padding: 0 $zl-padding * 2 $zl-padding * 6 $zl-padding * 2;
}
.help-item {
	display: flex;
	align-items: flex-start;
	color: var(--el-text-color-primary);
	& + & {
		margin-top: 16px;
	}
}
.help-item-label {
	flex-shrink: 0;
	min-width: 152px;
	font-size: 14px;
	line-height: 20px;
}
.help-item-value {
	font-size: 14px;
	line-height: 20px;
	color: var(--el-text-color-regular);
}
.help-link {
	display: inline-flex;
	align-items: center;
	gap: 11px;
	font-size: 14px;
	text-decoration: none;
	border-radius: 9999px;
	padding: 8px 15px;
	color: var(--el-text-color-primary);
	border: var(--el-border);
	background-color: var(--el-fill-color-blank);
	transition: 0.1s;
	@include no-select();
	&:hover {
		color: var(--el-color-primary);
		border-color: var(--el-color-primary-light-7);
		background-color: var(--el-color-primary-light-9);
		outline: none;
	}
}
</style>
