<!--
 * @Author: mulingyuer
 * @Date: 2025-10-16 11:38:31
 * @LastEditTime: 2025-10-16 11:45:02
 * @LastEditors: mulingyuer
 * @Description: 高级设置
 * @FilePath: \frontend\src\views\index-tts2\components\Advanced\index.vue
 * 怎么可能会有bug！！！
-->
<template>
	<div class="advanced">高级设置 {{ ruleForm }}</div>
</template>

<script setup lang="ts">
import type { RuleForm } from "../../types";

const ruleForm = defineModel("ruleForm", { type: Object as PropType<RuleForm>, required: true });
</script>

<style scoped></style>
