<!--
 * @Author: mulingyuer
 * @Date: 2025-09-24 09:51:09
 * @LastEditTime: 2025-11-06 15:57:45
 * @LastEditors: mulingyuer
 * @Description: 帮助页面
 * @FilePath: \frontend\src\views\help\index.vue
 * 怎么可能会有bug！！！
-->
<template>
	<BasePage class="help" title="帮助">
		<BaseCard :title="logoTitle">
			<BseDescription label="简介">这是一个由智灵算力平台开源的 TTS 音频生成平台。</BseDescription>
			<BseDescription label="最后更新时间">{{ commitTime }}</BseDescription>
			<BseDescription label="哈希">{{ commitId }}</BseDescription>
		</BaseCard>
		<BaseDivider />
		<BaseCard title="资源一览">
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
				<a class="help-link" href="https://serverless.datastone.cn/sprite/docs/zh/" target="_blank">
					<Icon name="ri-booklet-fill" :size="20" />
					<span>查看使用手册</span>
				</a>
			</ElSpacePro>
		</BaseCard>
		<BaseDivider />
		<BaseCard title="视频教程">
			<ElSpacePro :size="24" direction="vertical">
				<a class="help-link" href="javascript:;">
					<Icon name="ri-movie-fill" :size="20" />
					<span>录制中</span>
				</a>
			</ElSpacePro>
			<!-- <ElSpacePro :size="24" direction="vertical">
				<a class="help-link" href="https://www.bilibili.com/video/BV1VW61YxE5N" target="_blank">
					<Icon name="ri-movie-fill" :size="20" />
					<span>查看 智灵TTS HUB 使用教程</span>
				</a>
			</ElSpacePro> -->
		</BaseCard>
	</BasePage>
</template>

<script setup lang="ts">
import { formatDate } from "@/utils/dayjs";

const logoTitle = import.meta.env.VITE_APP_TITLE;
const commitTime = formatDate(__GIT_COMMIT_TIME__, "YYYY/MM/DD HH:mm:ss");
const commitId = __GIT_COMMIT_ID__;
</script>

<style lang="scss" scoped>
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
