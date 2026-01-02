# GLM Coding Plan Usage Monitor

GLM Coding Plan 使用情况监控命令行工具。

## 功能特性

- 实时监控 5小时 Token 通量占比
- 查看 1个月 MCP 使用情况
- 模型使用统计
- 工具使用统计
- 24小时每小时 Token 用量
- 完整数据可视化展示
- 自动刷新，可自定义间隔

## 安装

```bash
bun install
```

## 环境变量

使用前需要设置以下环境变量：

```bash
export ANTHROPIC_AUTH_TOKEN="your-token-here"
export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"
# 或
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
```

## 使用方式

### 默认模式（Token 通量占比）

```bash
bun run start
```

输出：
```
1.79%     ← 每10秒刷新
```

### Token 完整信息

```bash
bun run start -- -m token-full
```

输出：
```
14.32M,800.00M,785.68M,1.79%
```
格式：`已用,总额,剩余,占比`

### 完整数据展示

```bash
bun run start -- -m full
```

> ⚠️ `full`、`token-full`、`hourly`、`raw` 模式不支持刷新，只运行一次即退出。

### 其他模式

```bash
bun run start -- -m token       # Token通量占比
bun run start -- -m token-full  # Token已用/总额/剩余/占比
bun run start -- -m mcp         # 1个月MCP使用情况
bun run start -- -m model       # 模型使用统计
bun run start -- -m tool        # 工具使用统计
bun run start -- -m all         # 显示所有信息
bun run start -- -m hourly      # 24小时每小时Token用量（逗号分隔）
bun run start -- -m raw         # 打印完整API响应(JSON)
bun run start -- -m full        # 完整数据可视化展示
```

### 命令行参数

| 参数 | 说明 |
|------|------|
| `-m, --mode <模式>` | 显示模式 (token/token-full/mcp/model/tool/all/hourly/raw/full) |
| `-i, --interval <秒>` | 刷新间隔，默认10秒 |
| `-1, --once` | 只运行一次，不循环刷新 |
| `-h, --help` | 显示帮助信息 |

### 构建可执行文件

```bash
bun run build
```

构建后的文件位于 `dist/cli.js`。

## 示例

```bash
# 每5秒刷新一次完整数据
bun run start -- -m full -i 5

# 只运行一次查看 MCP 使用情况
bun run start -- -m mcp --once

# 默认模式，只显示百分比
bun run start
```

## 项目结构

```
.
├── src/
│   ├── types.ts      # 类型定义
│   ├── utils.ts      # 工具函数
│   ├── api.ts        # API 请求
│   ├── display.ts    # 显示模块
│   └── cli.ts        # 主入口
├── dist/             # 构建输出
├── package.json
└── tsconfig.json
```

## License

MIT
