/**
 * 工具函数
 */

import type { Colors, DisplayMode, Options } from './types.js';

// ANSI 颜色代码
export const colors: Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

/**
 * 清屏并移动光标到左上角
 */
export const clearScreen = (): void => {
  process.stdout.write('\x1b[2J\x1b[H');
}

/**
 * 解析命令行参数
 */
export const parseArgs = (): Options => {
  const args = process.argv.slice(2);
  const options: Options = {
    mode: 'token',
    interval: 10,
    once: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-m':
      case '--mode':
        options.mode = args[++i] as DisplayMode;
        break;
      case '-i':
      case '--interval':
        options.interval = parseInt(args[++i]) || 10;
        break;
      case '-1':
      case '--once':
        options.once = true;
        break;
    }
  }

  return options;
}

/**
 * 打印帮助信息
 */
export const printHelp = (): void => {
  console.log(`${colors.bright}GLM Coding Plan Usage Monitor${colors.reset}`);
  console.log('');
  console.log(`${colors.bright}用法:${colors.reset}`);
  console.log('  bun run src/cli.ts [选项]');
  console.log('  bun run start [选项]');
  console.log('');
  console.log(`${colors.bright}选项:${colors.reset}`);
  console.log(`  -m, --mode <模式>    显示模式 (默认: token)`);
  console.log(`                       ${colors.cyan}token${colors.reset}       - Token通量占比`);
  console.log(`                       ${colors.cyan}token-full${colors.reset} - Token已用/总额/剩余/占比`);
  console.log(`                       ${colors.cyan}hourly${colors.reset}      - 24小时每小时Token用量`);
  console.log(`                       ${colors.cyan}raw${colors.reset}         - 打印完整API响应(JSON)`);
  console.log(`                       ${colors.cyan}full${colors.reset}        - 完整数据可视化展示`);
  console.log(`  -i, --interval <秒>  刷新间隔，秒 (默认: 10)`);
  console.log(`  -1, --once           只运行一次，不循环刷新`);
  console.log(`  -h, --help           显示此帮助信息`);
  console.log('');
  console.log(`${colors.bright}环境变量:${colors.reset}`);
  console.log(`  ANTHROPIC_AUTH_TOKEN  认证令牌 (必需)`);
  console.log(`  ANTHROPIC_BASE_URL    API基础URL (必需)`);
}

/**
 * 格式化日期时间
 */
export const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 获取时间范围（近24小时）
 */
export const getTimeRange = (): { startTime: string; endTime: string } => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, now.getHours(), 0, 0, 0);
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 59, 59, 999);
  return {
    startTime: formatDateTime(startDate),
    endTime: formatDateTime(endDate),
  };
}

/**
 * 读取并验证环境变量
 */
export const readEnv = (): { baseUrl: string; authToken: string } => {
  const baseUrl = process.env.ANTHROPIC_BASE_URL || '';
  const authToken = process.env.ANTHROPIC_AUTH_TOKEN || '';

  if (!authToken) {
    console.error(`${colors.red}错误: ANTHROPIC_AUTH_TOKEN 未设置${colors.reset}`);
    console.error('');
    console.error('请设置环境变量后重试:');
    console.error('  export ANTHROPIC_AUTH_TOKEN="your-token-here"');
    process.exit(1);
  }

  if (!baseUrl) {
    console.error(`${colors.red}错误: ANTHROPIC_BASE_URL 未设置${colors.reset}`);
    console.error('');
    console.error('请设置环境变量后重试:');
    console.error('  export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"');
    console.error('  或');
    console.error('  export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"');
    process.exit(1);
  }

  return { baseUrl, authToken };
}

/**
 * 渲染进度条
 */
export const renderProgressBar = (percentage: number, width = 30): string => {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;

  let color = colors.green;
  if (percentage >= 80) color = colors.red;
  else if (percentage >= 50) color = colors.yellow;

  const bar = color + '█'.repeat(filled) + colors.dim + '░'.repeat(empty) + colors.reset;
  return `[${bar}] ${percentage.toFixed(1)}%`;
}

/**
 * 延迟函数
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
}
