<!--
 * @Author: mulingyuer
 * @Date: 2025-10-14 16:00:00
 * @LastEditTime: 2025-10-14 16:00:00
 * @LastEditors: mulingyuer
 * @Description: 重构后的语音参考组件 - 展示解耦后的使用方式
 * @FilePath: \frontend\src\components\VoiceReference\VoiceReference.vue
 * 怎么可能会有bug！！！
-->
<template>
  <div class="voice-reference">
    <el-tabs v-model="activeTab" class="voice-reference-tabs">
      <!-- 上传音频 -->
      <el-tab-pane label="上传音频" name="upload">
        <div class="tab-content">
          <AudioUploader
            v-if="!audioManager.hasAudio.value"
            :config="uploadConfig"
            @upload-success="handleUploadSuccess"
            @upload-error="handleUploadError"
          />
          
          <AudioPlayer
            v-else
            :audio-path="audioManager.currentPath.value"
            :play-state="audioManager.state.playState"
            :region-enabled="audioManager.state.regionEnabled"
            :loading="audioManager.state.loading"
            :height="playerHeight"
            @play-state-change="audioManager.setPlayState"
            @region-change="audioManager.setRegionEnabled"
            @cut-complete="handleCutComplete"
            @clear="handleClearAudio"
          />
        </div>
      </el-tab-pane>

      <!-- 录制音频 -->
      <el-tab-pane label="录制音频" name="record">
        <div class="tab-content">
          <AudioRecorder
            v-if="!audioManager.hasAudio.value || activeTab === 'record'"
            :upload-config="uploadConfig"
            :height="playerHeight"
            @upload-complete="handleRecordComplete"
            @state-change="handleRecordStateChange"
          />
          
          <AudioPlayer
            v-if="audioManager.hasAudio.value && activeTab !== 'record'"
            :audio-path="audioManager.currentPath.value"
            :play-state="audioManager.state.playState"
            :region-enabled="audioManager.state.regionEnabled"
            :loading="audioManager.state.loading"
            :height="playerHeight"
            @play-state-change="audioManager.setPlayState"
            @region-change="audioManager.setRegionEnabled"
            @cut-complete="handleCutComplete"
            @clear="handleClearAudio"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 音频历史记录 -->
    <div v-if="showHistory && audioManager.state.history.length > 0" class="voice-history">
      <el-divider content-position="left">
        <span class="history-title">历史记录</span>
      </el-divider>
      
      <div class="history-list">
        <div
          v-for="(item, index) in audioManager.state.history"
          :key="item.path"
          class="history-item"
          :class="{ active: item.path === audioManager.currentPath.value }"
          @click="audioManager.selectFromHistory(index)"
        >
          <div class="history-info">
            <div class="history-name">
              {{ item.fileName || `${item.source === 'upload' ? '上传' : '录制'}音频` }}
            </div>
            <div class="history-meta">
              {{ formatDate(item.createdAt) }}
              <span v-if="item.duration">· {{ AudioHelper.formatDuration(item.duration) }}</span>
            </div>
          </div>
          <el-button
            size="small"
            text
            @click.stop="removeFromHistory(index)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AudioUploader, AudioPlayer, AudioRecorder } from '@/components/Audio';
import { useAudioManager } from '@/hooks/useAudioManager';
import { AudioHelper } from '@/hooks/useWaveSurfer';
import type { AudioUploadConfig } from '@/hooks/useAudioUpload';

export interface VoiceReferenceProps {
  /** 播放器高度 */
  playerHeight?: string | number;
  /** 是否显示历史记录 */
  showHistory?: boolean;
  /** 上传配置 */
  uploadConfig?: AudioUploadConfig;
}

const props = withDefaults(defineProps<VoiceReferenceProps>(), {
  playerHeight: '200px',
  showHistory: true
});

const emit = defineEmits<{
  /** 音频选择完成 */
  'audio-selected': [path: string];
  /** 音频变化 */
  'audio-change': [audioInfo: any];
}>();

const activeTab = ref('upload');
const audioManager = useAudioManager();

/** 处理上传成功 */
const handleUploadSuccess = (path: string) => {
  audioManager.setCurrentAudio({
    path,
    source: 'upload',
    fileName: path.split('/').pop()
  });
  
  emit('audio-selected', path);
  emit('audio-change', audioManager.state.currentAudio);
};

/** 处理上传错误 */
const handleUploadError = (error: string) => {
  ElMessage.error(`上传失败: ${error}`);
};

/** 处理录制完成 */
const handleRecordComplete = (path: string) => {
  audioManager.setCurrentAudio({
    path,
    source: 'record',
    fileName: `录制音频_${new Date().toLocaleTimeString()}`
  });
  
  emit('audio-selected', path);
  emit('audio-change', audioManager.state.currentAudio);
};

/** 处理录制状态变化 */
const handleRecordStateChange = (state: string) => {
  console.log('录制状态变化:', state);
};

/** 处理裁剪完成 */
const handleCutComplete = (audioUrl: string) => {
  audioManager.handleAudioCut(audioUrl);
  emit('audio-selected', audioUrl);
  emit('audio-change', audioManager.state.currentAudio);
};

/** 处理清除音频 */
const handleClearAudio = () => {
  audioManager.clearCurrentAudio();
  emit('audio-change', null);
};

/** 从历史记录中移除 */
const removeFromHistory = (index: number) => {
  audioManager.state.history.splice(index, 1);
};

/** 格式化日期 */
const formatDate = (date: Date) => {
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/** 对外暴露音频管理器 */
defineExpose({
  audioManager,
  /** 清除当前音频 */
  clearAudio: () => audioManager.clearCurrentAudio(),
  /** 获取当前音频信息 */
  getCurrentAudio: () => audioManager.state.currentAudio,
  /** 设置音频 */
  setAudio: (path: string, source: 'upload' | 'record' = 'upload') => {
    audioManager.setCurrentAudio({ path, source });
  }
});
</script>

<style lang="scss" scoped>
.voice-reference {
  .voice-reference-tabs {
    :deep(.el-tabs__content) {
      padding: 0;
    }
  }
  
  .tab-content {
    min-height: 200px;
  }
}

.voice-history {
  margin-top: 16px;
  
  .history-title {
    font-size: 14px;
    color: var(--el-text-color-regular);
  }
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--el-fill-color-light);
  }
  
  &.active {
    background-color: var(--el-color-primary-light-9);
    border: 1px solid var(--el-color-primary-light-7);
  }
}

.history-info {
  flex: 1;
  min-width: 0;
  
  .history-name {
    font-size: 14px;
    color: var(--el-text-color-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .history-meta {
    font-size: 12px;
    color: var(--el-text-color-regular);
    margin-top: 2px;
  }
}
</style>