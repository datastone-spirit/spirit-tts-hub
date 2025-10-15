/*
 * @Author: mulingyuer
 * @Date: 2025-10-14 16:00:00
 * @LastEditTime: 2025-10-14 16:00:00
 * @LastEditors: mulingyuer
 * @Description: 音频上传 Hook
 * @FilePath: \frontend\src\hooks\useAudioUpload\index.ts
 * 怎么可能会有bug！！！
 */
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadRequestOptions } from 'element-plus';

export interface AudioUploadConfig {
    /** 上传路径 */
    uploadPath?: string;
    /** 最大文件大小 MB */
    maxSize?: number;
    /** 允许的文件类型 */
    accept?: string[];
    /** 自定义上传函数 */
    customUpload?: (file: File, onProgress?: (progress: number) => void) => Promise<string>;
}

export interface UploadState {
    /** 上传中 */
    loading: boolean;
    /** 上传进度 0-100 */
    progress: number;
    /** 上传完成 */
    completed: boolean;
    /** 上传后的文件路径 */
    filePath: string;
    /** 错误信息 */
    error: string | null;
}

export function useAudioUpload(config: AudioUploadConfig = {}) {
    const {
        uploadPath = '/root/audio-upload',
        maxSize = 50, // 50MB
        accept = ['audio/*'],
        customUpload
    } = config;

    const uploadState = reactive<UploadState>({
        loading: false,
        progress: 0,
        completed: false,
        filePath: '',
        error: null
    });

    /** 重置状态 */
    const resetState = () => {
        uploadState.loading = false;
        uploadState.progress = 0;
        uploadState.completed = false;
        uploadState.filePath = '';
        uploadState.error = null;
    };

    /** 验证文件 */
    const validateFile = (file: File): boolean => {
        // 检查文件大小
        if (file.size > maxSize * 1024 * 1024) {
            uploadState.error = `文件大小不能超过 ${maxSize}MB`;
            ElMessage.error(uploadState.error);
            return false;
        }

        // 检查文件类型
        const isValidType = accept.some(type => {
            if (type === 'audio/*') return file.type.startsWith('audio/');
            return file.type === type;
        });

        if (!isValidType) {
            uploadState.error = `不支持的文件类型: ${file.type}`;
            ElMessage.error(uploadState.error);
            return false;
        }

        return true;
    };

    /** 上传文件 */
    const uploadFile = async (file: File): Promise<string | null> => {
        if (!validateFile(file)) return null;

        resetState();
        uploadState.loading = true;

        try {
            let filePath: string;

            if (customUpload) {
                // 使用自定义上传函数
                filePath = await customUpload(file, (progress) => {
                    uploadState.progress = progress;
                });
            } else {
                // 默认上传逻辑（模拟）
                filePath = await defaultUpload(file);
            }

            uploadState.filePath = filePath;
            uploadState.completed = true;
            uploadState.loading = false;

            return filePath;
        } catch (error: any) {
            uploadState.error = error.message || '上传失败';
            uploadState.loading = false;
            ElMessage.error(uploadState.error);
            return null;
        }
    };

    /** 默认上传实现（模拟） */
    const defaultUpload = async (file: File): Promise<string> => {
        return new Promise((resolve) => {
            // 模拟上传进度
            let progress = 0;
            const timer = setInterval(() => {
                progress += Math.random() * 30;
                uploadState.progress = Math.min(progress, 100);

                if (progress >= 100) {
                    clearInterval(timer);
                    // 模拟返回文件路径
                    const mockPath = `/admin/src/assets/audio/${Date.now()}_${file.name}`;
                    resolve(mockPath);
                }
            }, 200);
        });
    };

    /** Element Plus 上传处理器 */
    const handleUpload = async (options: UploadRequestOptions) => {
        const { file, onSuccess, onError } = options;

        try {
            const filePath = await uploadFile(file);
            if (filePath) {
                onSuccess({ filePath });
            } else {
                onError(new Error(uploadState.error || '上传失败'));
            }
        } catch (error: any) {
            onError(error);
        }
    };

    /** 处理上传进度 */
    const handleProgress = () => {
        // Element Plus 的进度由内部状态管理
    };

    return {
        uploadState: readonly(uploadState),
        uploadFile,
        handleUpload,
        handleProgress,
        resetState,
        validateFile
    };
}