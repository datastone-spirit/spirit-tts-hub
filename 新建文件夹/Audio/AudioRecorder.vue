<!--
 * @Author: mulingyuer
 * @Date: 2025-10-14 16:00:00
 * @LastEditTime: 2025-10-14 16:00:00
 * @LastEditors: mulingyuer
 * @Description: 通用音频录制组件
 * @FilePath: \frontend\src\components\Audio\AudioRecorder.vue
 * 怎么可能会有bug！！！
-->
<template>
  <div class="audio-recorder">
    <div class="recorder-waveform-container">
      <div ref="waveformRef" class="recorder-waveform" />
      
      <div v-if="uploadState.loading" class="recorder-upload-overlay">
        <el-progress
          type="circle"
          :percentage="uploadState.progress"
          :width="60"
          :stroke-width="4"
          color="var(--el-color-primary)"
        />
      </div>
    </div>

    <div class="recorder-controls">
      <div class="recorder-controls-left">
        <ElSpacePro :size="8">
          <el-button
            v-if="['idle', 'stopped'].includes(state)"
            :icon="RiRecordCircleFill"
            type="danger"
            @click="handleStartRecord"
          >
            {{ startText || '开始录制' }}
          </el-button>
          
          <el-button
            v-if="!['idle', 'stopped'].includes(state)"
            :icon="RiStopCircleFill"
            @click="handleStopRecord"
          >
            {{ stopText || '停止录制' }}
          </el-button>
          
          <el-button
            v-if="state === 'recording'"
            :icon="RiPauseCircleFill"
            @click="handlePauseRecord"
          >
            {{ pauseText || '暂停' }}
          </el-button>
          
          <el-button
            v-if="state === 'paused'"
            :icon="RiPlayCircleFill"
            @click="handleResumeRecord"
          >
            {{ resumeText || '继续' }}
          </el-button>
        </ElSpacePro>
      </div>

      <div class="recorder-controls-right">
        <ElSpacePro :size="8">
          <span class="recorder-duration">{{ formattedDuration }}</span>
          
          <el-select
            v-if="showDeviceSelector && recordOptions.length > 0"
            v-model="selectedDevice"
            class="device-selector"
            placeholder="选择录音设备"
            size="small"
          >
            <el-option
              v-for="option in recordOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </ElSpacePro>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useWaveSurferRecord,
  AudioHelper,
  type WaveSurferInstance,
  type WaveSurferThemeKey
} from '@/hooks/useWaveSurfer';
import { useAudioUpload, type AudioUploadConfig } from '@/hooks/useAudioUpload';
import { useAppStore } from '@/stores';
import { useIcon } from '@/hooks/useIcon';

export interface RecordDevice {
  label: string;
  value: string;
}

export interface AudioRecorderProps {
  /** 是否显示设备选择器 */
  showDeviceSelector?: boolean;
  /** 开始录制按钮文字 */
  startText?: string;
  /** 停止录制按钮文字 */
  stopText?: string;
  /** 暂停按钮文字 */
  pauseText?: string;
  /** 继续按钮文字 */
  resumeText?: string;
  /** 上传配置 */
  uploadConfig?: AudioUploadConfig;
  /** 录制器高度 */
  height?: string | number;
}

const props = withDefaults(defineProps<AudioRecorderProps>(), {
  showDeviceSelector: true,
  height: '200px'
});

const emit = defineEmits<{
  /** 录制开始 */
  'record-start': [];
  /** 录制暂停 */
  'record-pause': [blob: Blob];
  /** 录制继续 */
  'record-resume': [];
  /** 录制结束 */
  'record-end': [blob: Blob];
  /** 录制上传完成 */
  'upload-complete': [path: string];
  /** 录制状态变化 */
  'state-change': [state: string];
}>();

// Icons
const RiRecordCircleFill = useIcon({ name: 'ri-record-circle-fill', size: 16 });
const RiStopCircleFill = useIcon({ name: 'ri-stop-circle-fill', size: 16 });
const RiPauseCircleFill = useIcon({ name: 'ri-pause-circle-fill', size: 16 });
const RiPlayCircleFill = useIcon({ name: 'ri-play-circle-fill', size: 16 });

const appStore = useAppStore();
const waveformRef = useTemplateRef<HTMLDivElement>('waveformRef');

// 录制相关
let recordInstance: WaveSurferInstance | undefined;
const selectedDevice = ref<string>('');
const recordOptions = ref<RecordDevice[]>([]);

const {
  state,
  recordData,
  recordEmitter,
  getRecordDevice,
  initRecord,
  destroyRecord,
  toggleTheme,
  startRecord,
  stopRecord,
  pauseRecord,
  resumeRecord,
  resetRecord
} = useWaveSurferRecord();

// 上传相关
const { uploadState, uploadFile } = useAudioUpload(props.uploadConfig);

/** 格式化录制时长 */
const formattedDuration = computed(() => {
  const duration = recordData.duration / 1000; // ms转s
  return AudioHelper.formatDuration(duration);
});

/** 获取录音设备 */
const getDevices = async () => {
  if (selectedDevice.value && recordOptions.value.length > 0) return;
  
  try {
    const devices = await getRecordDevice();
    if (devices.length > 0) {
      recordOptions.value = devices.map((device, index) => {
        if (index === 0) selectedDevice.value = device.deviceId;
        return {
          label: device.label || `设备 ${index + 1}`,
          value: device.deviceId
        };
      });
    } else {
      ElMessage.warning('没有可用的录音设备');
    }
  } catch (error) {
    console.error('获取录音设备失败:', error);
  }
};

/** 开始录制 */
const handleStartRecord = async () => {
  await getDevices();
  if (recordOptions.value.length === 0) return;

  startRecord({
    deviceId: selectedDevice.value
  });
};

/** 停止录制 */
const handleStopRecord = () => {
  stopRecord();
};

/** 暂停录制 */
const handlePauseRecord = () => {
  pauseRecord();
};

/** 继续录制 */
const handleResumeRecord = () => {
  resumeRecord();
};

/** 处理录制完成并上传 */
const handleRecordComplete = async (blob: Blob) => {
  try {
    // 创建文件对象
    const fileName = `record_${Date.now()}.wav`;
    const file = new File([blob], fileName, { type: 'audio/wav' });
    
    // 上传文件
    const filePath = await uploadFile(file);
    
    if (filePath) {
      emit('upload-complete', filePath);
      // 重置录制状态
      resetRecord();
    }
  } catch (error) {
    console.error('录制文件上传失败:', error);
    ElMessage.error('录制文件上传失败');
  }
};

/** 监听录制事件 */
recordEmitter.on('record-start', () => {
  emit('record-start');
});

recordEmitter.on('record-pause', (blob) => {
  emit('record-pause', blob);
});

recordEmitter.on('record-resume', () => {
  emit('record-resume');
});

recordEmitter.on('record-end', (blob) => {
  emit('record-end', blob);
  handleRecordComplete(blob);
});

/** 监听状态变化 */
watch(state, (newState) => {
  emit('state-change', newState);
});

/** 监听主题变化 */
watchEffect(() => {
  if (!recordInstance) return;
  const theme: WaveSurferThemeKey = appStore.isDark ? 'dark' : 'light';
  toggleTheme(theme);
});

onMounted(async () => {
  await getDevices();
  
  if (!waveformRef.value) return;
  
  recordInstance = initRecord({
    container: waveformRef.value,
    theme: appStore.isDark ? 'dark' : 'light'
  });
});

onUnmounted(() => {
  destroyRecord();
});

/** 对外暴露的方法和状态 */
defineExpose({
  state,
  recordData,
  uploadState,
  selectedDevice,
  recordOptions,
  startRecord: handleStartRecord,
  stopRecord: handleStopRecord,
  pauseRecord: handlePauseRecord,
  resumeRecord: handleResumeRecord,
  resetRecord,
  getDevices
});
</script>

<style lang="scss" scoped>
.audio-recorder {
  display: flex;
  flex-direction: column;
  height: v-bind(height);
}

.recorder-waveform-container {
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: $zl-padding;
  position: relative;
  overflow: hidden;
  flex: 1;
}

.recorder-waveform {
  height: 100%;
  position: relative;
  z-index: 1;
}

.recorder-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
}

.recorder-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid var(--el-border-color-lighter);
}

.recorder-controls-left {
  flex: 1;
}

.recorder-controls-right {
  flex-shrink: 0;
}

.recorder-duration {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.device-selector {
  min-width: 150px;
}
</style>