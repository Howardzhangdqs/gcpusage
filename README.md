# gcpusage

GLM Coding Plan 使用情况监控 CLI 工具。

## 安装

### npm 全局安装

```bash
npm install -g gcpusage
```

### npx（无需安装）

```bash
npx gcpusage token-full
```

### 从源码构建

```bash
git clone https://github.com/Howardzhangdqs/gcpusage.git
cd glm-coding-plan-usage

bun install
bun run build
# 构建产物在 dist/cli.js
```

## 配置

设置环境变量（推荐）：

```bash
export ANTHROPIC_AUTH_TOKEN="your-token-here"
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
# 或
export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"
```

## 使用

### 方式一：使用环境变量（推荐）

```bash
# 设置 token 后直接使用
gcpusage              # 百分比 (默认)
gcpusage token-full   # 完整信息
gcpusage token-used   # 已用
gcpusage token-total  # 总量
```

### 方式二：传入 token

```bash
gcpusage your-token-here
gcpusage your-token-here token-full
```

## 命令

| 命令 | 输出 | 示例 |
|------|------|------|
| `gcpusage` | 百分比 | `0.82` |
| `gcpusage token-full` | 已用,总额,剩余,百分比 | `6.55M,800.00M,793.45M,0.82%` |
| `gcpusage token-total` | Token 总量 | `800.00M` |
| `gcpusage token-used` | 已用 Token | `6.55M` |
| `gcpusage token-remaining` | 剩余 Token | `793.45M` |
| `gcpusage token-percent` | 百分比 | `0.82` |
| `gcpusage hourly` | 24 小时 Token 用量（逗号分隔） | `1000,2000,...` |
| `gcpusage raw` | API 响应 (JSON) | `{...}` |
| `gcpusage full` | 完整表格展示 | 表格 |
| `gcpusage -i 5` | 每 5 秒自动刷新 | 持续输出 |

## 选项

| 选项 | 说明 |
|------|------|
| `<mode>` | 直接指定模式 |
| `-m, --mode <模式>` | 指定显示模式 |
| `-i, --interval <秒>` | 刷新间隔（设置后才会自动刷新） |
| `-h, --help` | 显示帮助信息 |

## License

MIT
