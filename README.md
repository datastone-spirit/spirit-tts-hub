# Spirit TTS Hub

智灵 TTS 平台，提供文本转语音（TTS）能力与配套管理接口。后端基于 Flask，前端基于 Vite + Vue。

接口文档（Swagger）：`/apidocs/#/`

## 项目结构
- `backend/` 后端服务（Flask + Flasgger）
- `frontend/` 前端应用（Vite + Vue）

## 后端使用指南（backend）

### 环境要求
- Python `3.8+`
- `pip` 或 `pip3`

### 安装依赖
```
cd backend
pip install -r requirements.txt
```

如需 GPU 版本的 PyTorch（与 CUDA 版本保持一致），请参考 backend/README.md 中的说明。例如：
```
pip install --index-url https://download.pytorch.org/whl/cu128 \
  torch==2.8.0+cu128 torchaudio==2.8.0+cu128 torchvision==0.23.0+cu128

# 安装 index-tts 依赖到系统环境
uv pip install --system -e ./index-tts
```

### 环境变量配置（模型缓存与路径）
- HuggingFace 缓存相关（示例路径按需调整）：
```
HF_HUB_CACHE=/workspace/spirit-tts-hub/backend/checkpoints/hf_cache
HUGGINGFACE_HUB_CACHE=/workspace/spirit-tts-hub/backend/checkpoints/hf_cache
HF_HOME=/workspace/spirit-tts-hub/backend/checkpoints/hf_cache
TRANSFORMERS_CACHE=/workspace/spirit-tts-hub/backend/checkpoints/hf_cache
```
- 路径类配置（用于文件上传、历史与输出目录、角色配置存储目录）：
```
upload_path=/home/dev/spirit-tts-hub/backend/uploads
history_path=/home/dev/spirit-tts-hub/backend/history
output_path=/home/dev/spirit-tts-hub/backend/outputs
role_path=/home/dev/spirit-tts-hub/backend/data/roles

# 可选：指定配置文件存放位置（包含文件名）
FLASK_CONF_DIR=/home/dev/spirit-tts-hub/conf/conf.json
```
- 若需将当前环境变量写入配置文件，可调用接口：`POST /api/files/config/reset`

### 模型预下载（可选，启动前）
为减少首次请求的等待时间，可在启动前预下载 IndexTTS 所需权重：
```
cd backend
python scripts/prefetch_index_tts.py --hf-cache ./checkpoints/hf_cache --full-init
```
支持离线与统一缓存等模式，详见 `backend/scripts/prefetch_index_tts.py` 的帮助说明。

### 启动服务
```
# 在 backend 目录内启动
cd backend
python app.py

# 或在项目根目录指定环境后启动
FLASK_ENV=development python backend/app.py
```

## 前端使用指南（frontend）

### 环境要求
- Node.js `v22.20.0`（或更高）
- pnpm `10.0.0`（或更高）

安装示例：
```
# 安装 nvm（按需）并使用其安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm install v22.20.0

# 安装 pnpm
npm install -g pnpm
```

### 环境变量
- 开发模式：在项目根目录创建 `.env.development`，参考 `frontend/.env.example`，且设置 `NODE_ENV=development`
- 生产模式：默认使用 `frontend/.env.production`
- 自定义文件：使用 `-mode xxx` 指定，例如：`pnpm run build -mode aaa` 将读取 `.env.aaa`

### 安装与构建
```
cd frontend
pnpm install
pnpm run build
```
构建产物输出至 `frontend/dist`。

## 常见问题
- 首次运行耗时较长：建议先执行“模型预下载”脚本；或在服务启动后首次调用前耐心等待权重加载。
- CUDA/驱动不匹配：请确保 Torch、TorchAudio、TorchVision 与 CUDA 版本一致；参见后端 README 中的安装说明。

