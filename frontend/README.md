# 智灵 TTS HUB

智灵 TTS HUB 是一款操作友好的 TTS 语音生成工具，为用户提供便捷的语音生成功能，目前已集成了 `IndexTTS2` 文本转语音（TTS）模型，后续将继续集成更多的 TTS 模型，并支持更多语音合成引擎。

## 环境变量

### 开发模式

需要在项目根目录创建 `.env.development` 文件，并在其中添加`.env.example`示例文件中定义的环境变量，其中 `NODE_ENV` 变量需要设置为 `development`

示例：

```env
# 本地环境
NODE_ENV="development"

```

### 生产模式

默认情况下已经设置好了生产环境的环境变量，无需额外设置。如果有定制需求可以自行修改 `.env.production` 文件。

### 自定义环境变量文件

如果需要使用自定义环境变量文件，需要使用`-mode xxx`命令模式，比如我们使用`build`命令打包：

```bash
pnpm run build -mode aaa
```

这就表示build命令需要使用`.env.aaa`环境变量文件。


## 环境要求

我们需要安装Node.js环境，并安装pnpm包管理工具。可以通过以下命令安装：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh |bash
```

安装 nvm 后，通过以下命令安装 Node.js。推荐安装 v20.0.0 及以上版本：

```bash
nvm install v22.20.0
```

Node.js 安装完成后，使用以下命令安装 pnpm。推荐安装 pnpm 10.0.0 及以上版本：

```bash
npm install -g pnpm
```

## 构建与运行

在运行前端之前，你必须先将前端项目打包构建。为此，请进入到 `frontend` 目录，并运行以下命令以安装依赖项：

```bash
pnpm install
```

安装依赖项后，运行以下命令构建前端。构建完成后，生成的文件将保存到 `frontend/dist` 目录中：

```bash
pnpm run build
```

