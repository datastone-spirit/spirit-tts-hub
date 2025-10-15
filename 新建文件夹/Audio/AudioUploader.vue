<!--
 * @Author: mulingyuer
 * @Date: 2025-10-14 16:00:00
 * @LastEditTime: 2025-10-14 16:00:00
 * @LastEditors: mulingyuer
 * @Description: 通用音频上传组件
 * @FilePath: \frontend\src\components\Audio\AudioUploader.vue
 * 怎么可能会有bug！！！
-->
<template>
  <div class="audio-uploader">
    <el-upload
      ref="uploadRef"
      class="audio-uploader-input"
      drag
      accept="audio/*"
      :show-file-list="false"
      :limit="1"
      :on-exceed="handleExceed"
      :http-request="handleUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :disabled="uploadState.loading"
    >
      <div v-if="!uploadState.loading" class="audio-uploader-content">
        <Icon class="upload-icon" name="ri-upload-2-line" />
        <div class="upload-text">
          <div>{{ dragText || '将音频文件拖拽到此处或' }}</div>
          <div class="upload-divider">- 或 -</div>
          <div><em>{{ clickText || '点击上传' }}</em></div>
        </div>
      </div>
      <div v-else class="audio-uploader-progress">
        <el-progress
          type="circle"
          :percentage="uploadState.progress"
          :width="progressSize"
          :stroke-width="5"
          color="var(--el-color-primary)"
        />
      </div>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { genFileId, type UploadInstance, type UploadRawFile } from 'element-plus';
import { useAudioUpload, type AudioUploadConfig } from '@/hooks/useAudioUpload';

export interface AudioUploaderProps {
  /** 拖拽提示文字 */
  dragText?: string;
  /** 点击提示文字 */
  clickText?: string;
  /** 进度条大小 */
  progressSize?: number;
  /** 上传配置 */
  config?: AudioUploadConfig;
}

const props = withDefaults(defineProps<AudioUploaderProps>(), {
  progressSize: 80
});

const emit = defineEmits<{
  /** 上传成功 */
  'upload-success': [path: string];
  /** 上传失败 */
  'upload-error': [error: string];
}>();

const uploadRef = useTemplateRef<UploadInstance>('uploadRef');
const { uploadState, handleUpload: _handleUpload } = useAudioUpload(props.config);

/** 处理文件超出限制 */
const handleExceed = (files: File[]) => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
};

/** 处理上传 */
const handleUpload = _handleUpload;

/** 上传成功 */
const handleSuccess = (response: any) => {
  const filePath = response.filePath || response.data?.path;
  if (filePath) {
    emit('upload-success', filePath);
  }
  uploadRef.value?.clearFiles();
};

/** 上传失败 */
const handleError = (error: any) => {
  const errorMessage = error.message || '上传失败';
  emit('upload-error', errorMessage);
  uploadRef.value?.clearFiles();
};

/** 对外暴露上传状态 */
defineExpose({
  uploadState,
  clearFiles: () => uploadRef.value?.clearFiles()
});
</script>

<style lang="scss" scoped>
.audio-uploader-input {
  :deep(.el-upload-dragger) {
    padding: $zl-padding;
    height: 100%;
    min-height: 120px;
  }
}

.audio-uploader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  
  .upload-icon {
    font-size: 36px;
    margin-bottom: 8px;
    color: var(--el-text-color-regular);
  }
  
  .upload-text {
    text-align: center;
    color: var(--el-text-color-regular);
    
    .upload-divider {
      opacity: 0.5;
      margin: 4px 0;
    }
    
    em {
      color: var(--el-color-primary);
      font-style: normal;
    }
  }
}

.audio-uploader-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: var(--el-bg-color);
}
</style>