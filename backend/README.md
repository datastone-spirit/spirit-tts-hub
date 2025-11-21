# Spirit TTS Hub 后端服务

这是 Spirit TTS Hub 的后端服务，基于 Flask 框架开发，提供 TTS（文本转语音）相关的 API 服务。


## 环境要求

- Python 3.8+
- pip 或 pip3

## 安装与配置

### 1. 安装依赖

```bash
cd /spirit-tts-hub/backend
pip install -r requirements.txt
```

### 2. 环境变量配置

```sh
# 如果在本地跑，路径换成 ./checkpoints/hf_cache
HF_HUB_CACHE=/workspace/spirit-tts-hub/backend/checkpoints/hf_cache
HUGGINGFACE_HUB_CACHE=/workspace/spirit-tts-hub/backend/checkpoints/hf_cache
HF_HOME=/workspace/spirit-tts-hub/backend/checkpoints/hf_cache
TRANSFORMERS_CACHE=/workspace/spirit-tts-hub/backend/checkpoints/hf_cache

```



## 启动服务

### 开发环境

```bash
# 安装indextts依赖到全局
uv pip install -e ./backend/index-tts
# 进入到index-tts目录 下载tts模型  也可以加（export HF_ENDPOINT="https://hf-mirror.com"），方便下载模型
modelscope download --model IndexTeam/IndexTTS-2 --local_dir checkpoints
# 启动服务前，先执行这个，把模型权重预下载到缓存目录，避免项目启动后下载
python backend/scripts/prefetch_index_tts.py --hf-cache ./checkpoints/hf_cache --full-init 
# 启动backend 
python app.py
# 指定环境，启动服务
FLASK_ENV=development python backend/app.py
# 接口文档地址 /apidocs/#/
```

## 模型预下载（启动前）

为减少首次请求的等待时间，你可以在服务启动前预下载 IndexTTS 所需的远端权重。

脚本位置：`backend/scripts/prefetch_index_tts.py`

- 远端权重预下载（轻量，推荐）
  ```bash
  cd /path/to/spirit-tts-hub/backend
  python scripts/prefetch_index_tts.py --hf-cache ./checkpoints/hf_cache --full-init
  ```
  说明：
  - 默认从 `index-tts/checkpoints/config.yaml` 读取 vocoder 名称，并下载：
    - `facebook/w2v-bert-2.0`（SeamlessM4T 特征提取器）
    - `amphion/MaskGCT` 的 `semantic_codec/model.safetensors`
    - `funasr/campplus` 的 `campplus_cn_common.bin`
    - BigVGAN vocoder（依据 `cfg.vocoder.name`）
  - 默认缓存目录：`backend/checkpoints/hf_cache`（脚本会自动设置 `HF_HUB_CACHE` 并创建目录）
  - 支持统一缓存与离线模式：
    ```bash
    # 统一缓存 + 开启离线开关（推荐清晰的部署流程）
    python scripts/prefetch_index_tts.py --hf-cache /home/dev/spirit-tts-hub/backend/checkpoints/hf_cache --offline
    ```

- 全量初始化预下载（会尝试加载本地 checkpoint）
  ```bash
  cd /path/to/spirit-tts-hub/backend
    python scripts/prefetch_index_tts.py --full-init --device cpu \
      --cfg ./index-tts/checkpoints/config.yaml \
      --model-dir ./index-tts/checkpoints \
      --hf-cache ./checkpoints/hf_cache
  ```

- 自定义参数
  - `--cfg`：配置文件路径（默认：`./index-tts/checkpoints/config.yaml`）
  - `--model-dir`：本地模型目录（默认：`./index-tts/checkpoints`）
  - `--hf-cache`：HuggingFace 缓存目录（默认：`./checkpoints/hf_cache`）
  - `--full-init`：启用完整初始化模式（否则只下载远端权重）
  - `--device`：完整初始化使用的设备，如 `cpu` 或 `cuda:0`
  - `--use-fp16`：完整初始化时启用 FP16（CPU 上无效）
  - `--use-cuda-kernel`：完整初始化时启用 BigVGAN CUDA kernel（仅 CUDA 设备）


```sh
保持三者一致： torch 2.8.* 、 torchaudio 2.8.* 、 torchvision 0.23.* 且都为 +cu128 ，确保与 CUDA 12.8 对齐

pip install --index-url https://download.pytorch.org/whl/cu128 torch==2.8.0+cu128 torchaudio==2.8.0+cu128 torchvision==0.23.0+cu128

在backend目录中安装index-tts依赖：uv pip install --system -e ./index-tts

如需单独装 torchvision ，同样指定 cu128 索引
uv pip install --index-url https://download.pytorch.org/whl/cu126 torchvision==0.23.0+cu126
```

接口文档地址：/apidocs