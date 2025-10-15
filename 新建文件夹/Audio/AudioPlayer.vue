<!--
 * @Author: mulingyuer
 * @Date: 2025-10-14 16:00:00
 * @LastEditTime: 2025-10-14 16:00:00
 * @LastEditors: mulingyuer
 * @Description: 通用音频播放器组件
 * @FilePath: \frontend\src\components\Audio\AudioPlayer.vue
 * 怎么可能会有bug！！！
-->
<template>
  <div class="audio-player" :class="{ 'has-controls': showControls }">
    <div class="audio-player-waveform-container">
      <el-button
        v-if="showClearButton"
        class="audio-player-clear"
        :icon="RiCloseFill"
        size="small"
        @click="handleClear"
      />
      <div class="audio-player-waveform" ref="waveformRef" />
    </div>
    
    <div v-if="showDuration" class="audio-player-duration">
      <div class="current-time">
        {{ AudioHelper.formatDuration(playerData.currentDuration) }}
      </div>
      <div class="total-time">
        <span v-if="regionEnabled" class="region-duration">
          {{ AudioHelper.formatDuration(playerData.regionEnd - playerData.regionStart) }}
        </span>
        <span class="total-duration">
          {{ AudioHelper.formatDuration(playerData.totalDuration) }}
        </span>
      </div>
    </div>

    <div v-if="showControls" class="audio-player-controls">
      <ElSpacePro :size="8">
        <el-button
          :icon="RiSkipBackFill"
          size="small"
          @click="playerControls.rewind()"
        />
        <el-button
          :icon="playState === 'playing' ? RiPauseFill : RiPlayFill"
          type="primary"
          @click="playerControls.playPause()"
        />
        <el-button
          :icon="RiSkipForwardFill"
          size="small"
          @click="playerControls.fastForward()"
        />
        <el-button
          v-if="enableRegion"
          :icon="RiScissorsFill"
          :type="regionEnabled ? 'warning' : 'default'"
          size="small"
          @click="toggleRegion"
        >
          {{ regionEnabled ? '取消选区' : '选择区域' }}
        </el-button>
        <el-button
          v-if="regionEnabled"
          :icon="RiCropFill"
          type="success"
          size="small"
          @click="handleCut"
        >
          裁剪
        </el-button>
      </ElSpacePro>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AudioHelper,
  useWaveSurferPlayer,
  type WaveSurferInstance,
  type WaveSurferThemeKey
} from '@/hooks/useWaveSurfer';
import { useAppStore } from '@/stores';
import { useIcon } from '@/hooks/useIcon';

export interface AudioPlayerProps {
  /** 音频文件路径 */
  audioPath: string;
  /** 播放状态 */
  playState?: 'idle' | 'playing' | 'paused' | 'ended';
  /** 是否启用区域选择 */
  regionEnabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 是否显示控制按钮 */
  showControls?: boolean;
  /** 是否显示时长信息 */
  showDuration?: boolean;
  /** 是否显示清除按钮 */
  showClearButton?: boolean;
  /** 是否启用区域功能 */
  enableRegion?: boolean;
  /** 播放器高度 */
  height?: string | number;
}

const props = withDefaults(defineProps<AudioPlayerProps>(), {
  playState: 'idle',
  regionEnabled: false,
  loading: false,
  showControls: true,
  showDuration: true,
  showClearButton: true,
  enableRegion: true,
  height: '200px'
});

const emit = defineEmits<{
  /** 播放状态变化 */
  'play-state-change': [state: string];
  /** 区域状态变化 */
  'region-change': [enabled: boolean];
  /** 裁剪完成 */
  'cut-complete': [audioUrl: string];
  /** 清除 */
  'clear': [];
}>();

// Icons
const RiCloseFill = useIcon({ name: 'ri-close-fill', size: 14 });
const RiPlayFill = useIcon({ name: 'ri-play-fill', size: 16 });
const RiPauseFill = useIcon({ name: 'ri-pause-fill', size: 16 });
const RiSkipBackFill = useIcon({ name: 'ri-skip-back-fill', size: 16 });
const RiSkipForwardFill = useIcon({ name: 'ri-skip-forward-fill', size: 16 });
const RiScissorsFill = useIcon({ name: 'ri-scissors-fill', size: 16 });
const RiCropFill = useIcon({ name: 'ri-crop-fill', size: 16 });

const appStore = useAppStore();
const waveformRef = useTemplateRef<HTMLDivElement>('waveformRef');

let playerInstance: WaveSurferInstance | undefined;

const {
  initPlayer,
  destroyPlayer,
  toggleTheme,
  playerData,
  playerControls,
  regionControls,
  playerEmitter,
  state,
  isRegion,
  loading
} = useWaveSurferPlayer({
  loading: toRef(() => props.loading),
  state: toRef(() => props.playState),
  isRegion: toRef(() => props.regionEnabled),
  loop: false
});

/** 监听主题变化 */
watchEffect(() => {
  if (!playerInstance) return;
  const theme: WaveSurferThemeKey = appStore.isDark ? 'dark' : 'light';
  toggleTheme(theme);
});

/** 监听音频路径变化 */
watchEffect(() => {
  if (props.audioPath && playerInstance) {
    loading.value = true;
    playerInstance.load(props.audioPath);
  }
});

/** 监听播放状态变化 */
watch(state, (newState) => {
  emit('play-state-change', newState);
});

/** 监听区域状态变化 */
watch(isRegion, (enabled) => {
  emit('region-change', enabled);
});

/** 监听裁剪完成事件 */
playerEmitter.on('region-complete', (audioUrl: string) => {
  emit('cut-complete', audioUrl);
});

/** 切换区域选择 */
const toggleRegion = () => {
  if (isRegion.value) {
    regionControls.deleteRegion();
  } else {
    regionControls.addRegion();
  }
};

/** 处理裁剪 */
const handleCut = () => {
  regionControls.cut();
};

/** 处理清除 */
const handleClear = () => {
  regionControls.deleteRegion();
  playerControls.stop();
  emit('clear');
};

onMounted(() => {
  if (!waveformRef.value) return;
  
  playerInstance = initPlayer({
    container: waveformRef.value,
    url: props.audioPath,
    theme: appStore.isDark ? 'dark' : 'light'
  });
});

onUnmounted(() => {
  destroyPlayer();
});

/** 对外暴露的方法 */
defineExpose({
  /** 播放/暂停 */
  playPause: () => playerControls.playPause(),
  /** 停止 */
  stop: () => playerControls.stop(),
  /** 快退 */
  rewind: () => playerControls.rewind(),
  /** 快进 */
  fastForward: () => playerControls.fastForward(),
  /** 添加区域 */
  addRegion: () => regionControls.addRegion(),
  /** 删除区域 */
  deleteRegion: () => regionControls.deleteRegion(),
  /** 裁剪 */
  cut: () => regionControls.cut(),
  /** 获取播放器实例 */
  getPlayer: () => playerInstance,
  /** 播放器数据 */
  playerData
});
</script>

<style lang="scss" scoped>
.audio-player {
  display: flex;
  flex-direction: column;
  height: v-bind(height);
  
  &.has-controls {
    .audio-player-waveform-container {
      flex: 1;
    }
  }
}

.audio-player-waveform-container {
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: $zl-padding;
  position: relative;
  overflow: hidden;
  flex: 1;
}

.audio-player-clear {
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px;
  border-top: none;
  border-right: none;
  border-radius: 0 6px 0 6px;
  z-index: 2;
}

.audio-player-waveform {
  height: 100%;
  position: relative;
  z-index: 1;
  
  :deep(::part(region-handle-left)) {
    border-left-color: var(--el-color-warning);
  }
  
  :deep(::part(region-handle-right)) {
    border-right-color: var(--el-color-warning);
  }
  
  :deep(::part(default-selection)) {
    background-color: rgba(32, 189, 160, 0.2);
  }
}

.audio-player-duration {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  
  .region-duration {
    color: var(--el-color-primary);
    margin-right: 8px;
  }
}

.audio-player-controls {
  padding: 8px 0;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>