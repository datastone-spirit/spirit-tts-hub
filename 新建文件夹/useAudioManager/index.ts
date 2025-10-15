/*
 * @Author: mulingyuer
 * @Date: 2025-10-14 16:00:00
 * @LastEditTime: 2025-10-14 16:00:00
 * @LastEditors: mulingyuer
 * @Description: 音频管理 Hook - 统一管理音频状态和操作
 * @FilePath: \frontend\src\hooks\useAudioManager\index.ts
 * 怎么可能会有bug！！！
 */
import { ref, reactive, computed } from 'vue';
import type { AudioState } from '@/hooks/useWaveSurfer/player';

export type AudioSource = 'upload' | 'record' | 'url';

export interface AudioInfo {
    /** 音频文件路径 */
    path: string;
    /** 原始路径（裁剪前） */
    originalPath?: string;
    /** 音频来源 */
    source: AudioSource;
    /** 文件名 */
    fileName?: string;
    /** 文件大小 */
    fileSize?: number;
    /** 音频时长 */
    duration?: number;
    /** 创建时间 */
    createdAt: Date;
}

export interface AudioManagerState {
    /** 当前音频信息 */
    currentAudio: AudioInfo | null;
    /** 音频播放状态 */
    playState: AudioState;
    /** 是否启用区域选择 */
    regionEnabled: boolean;
    /** 文件加载中 */
    loading: boolean;
    /** 历史记录 */
    history: AudioInfo[];
}

export function useAudioManager() {
    const state = reactive<AudioManagerState>({
        currentAudio: null,
        playState: 'idle',
        regionEnabled: false,
        loading: false,
        history: []
    });

    /** 是否有音频 */
    const hasAudio = computed(() => !!state.currentAudio);

    /** 当前音频路径 */
    const currentPath = computed(() => state.currentAudio?.path || '');

    /** 设置当前音频 */
    const setCurrentAudio = (audioInfo: Partial<AudioInfo> & { path: string; source: AudioSource }) => {
        const newAudio: AudioInfo = {
            ...audioInfo,
            createdAt: new Date()
        };

        state.currentAudio = newAudio;
        state.playState = 'idle';
        state.regionEnabled = false;

        // 添加到历史记录
        addToHistory(newAudio);
    };

    /** 更新音频信息 */
    const updateCurrentAudio = (updates: Partial<AudioInfo>) => {
        if (state.currentAudio) {
            Object.assign(state.currentAudio, updates);
        }
    };

    /** 清除当前音频 */
    const clearCurrentAudio = () => {
        state.currentAudio = null;
        state.playState = 'idle';
        state.regionEnabled = false;
        state.loading = false;
    };

    /** 设置播放状态 */
    const setPlayState = (playState: AudioState) => {
        state.playState = playState;
    };

    /** 设置区域选择状态 */
    const setRegionEnabled = (enabled: boolean) => {
        state.regionEnabled = enabled;
    };

    /** 设置加载状态 */
    const setLoading = (loading: boolean) => {
        state.loading = loading;
    };

    /** 添加到历史记录 */
    const addToHistory = (audioInfo: AudioInfo) => {
        // 避免重复添加相同路径的音频
        const existingIndex = state.history.findIndex(item => item.path === audioInfo.path);
        if (existingIndex > -1) {
            state.history.splice(existingIndex, 1);
        }

        state.history.unshift(audioInfo);

        // 限制历史记录数量
        if (state.history.length > 10) {
            state.history = state.history.slice(0, 10);
        }
    };

    /** 从历史记录中选择音频 */
    const selectFromHistory = (index: number) => {
        const audioInfo = state.history[index];
        if (audioInfo) {
            setCurrentAudio(audioInfo);
        }
    };

    /** 清除历史记录 */
    const clearHistory = () => {
        state.history = [];
    };

    /** 处理音频裁剪完成 */
    const handleAudioCut = (newPath: string) => {
        if (state.currentAudio) {
            const originalPath = state.currentAudio.originalPath || state.currentAudio.path;

            updateCurrentAudio({
                path: newPath,
                originalPath,
                createdAt: new Date()
            });

            // 添加裁剪后的音频到历史记录
            addToHistory(state.currentAudio);
        }
    };

    /** 恢复到原始音频 */
    const restoreOriginal = () => {
        if (state.currentAudio?.originalPath) {
            updateCurrentAudio({
                path: state.currentAudio.originalPath,
                originalPath: undefined
            });
        }
    };

    return {
        state: readonly(state),
        hasAudio,
        currentPath,
        setCurrentAudio,
        updateCurrentAudio,
        clearCurrentAudio,
        setPlayState,
        setRegionEnabled,
        setLoading,
        addToHistory,
        selectFromHistory,
        clearHistory,
        handleAudioCut,
        restoreOriginal
    };
}