#!/usr/bin/env bun
/**
 * GLM Coding Plan Usage Monitor
 * 实时监控 GLM Coding Plan 的使用情况
 *
 * CLI 用法:
 *   gcpusage <token>              - 输出百分比
 *   gcpusage <token> -m token-full - 完整信息
 *   gcpusage <token> -i 5         - 自动刷新
 */

import type { Options } from './types.js';
import {
  clearScreen,
  colors,
  delay,
  getTimeRange,
  parseArgs,
  printHelp,
  readEnv,
} from './utils.js';
import { fetchAllData, fetchHourlyData, fetchRawData, getApiEndpoints } from './api.js';
import {
  displayByMode,
  displayFull,
  displayHeader,
  displayHourlyUsage,
  displayTokenFull,
  displayTokenSimple,
  displayTokenTotal,
  displayTokenUsed,
  displayTokenRemaining,
  displayTokenPercent,
} from './display.js';

/**
 * 获取数据并显示（简化模式 - token 相关模式）
 */
const fetchAndDisplaySimple = async (
  options: Options,
  authToken: string
): Promise<void> => {
  try {
    const { endpoints } = getApiEndpoints(process.env.ANTHROPIC_BASE_URL!);
    const { startTime, endTime } = getTimeRange();

    const { quotaData } = await fetchAllData(
      endpoints,
      authToken,
      startTime,
      endTime
    );

    // 根据模式选择显示方式
    switch (options.mode) {
      case 'token-full':
        displayTokenFull(quotaData);
        break;
      case 'token-total':
        displayTokenTotal(quotaData);
        break;
      case 'token-used':
        displayTokenUsed(quotaData);
        break;
      case 'token-remaining':
        displayTokenRemaining(quotaData);
        break;
      case 'token-percent':
        displayTokenPercent(quotaData);
        break;
      default:
        displayTokenSimple(quotaData);
    }

  } catch (error) {
    console.log(`${colors.red}错误: ${(error as Error).message}${colors.reset}`);
  }
};

/**
 * 获取数据并显示（完整模式）
 */
const fetchAndDisplay = async (
  options: Options,
  platform: string,
  authToken: string
): Promise<void> => {
  try {
    const { endpoints } = getApiEndpoints(process.env.ANTHROPIC_BASE_URL!);
    const { startTime, endTime } = getTimeRange();

    const { modelData, toolData, quotaData } = await fetchAllData(
      endpoints,
      authToken,
      startTime,
      endTime
    );

    // 清屏显示
    clearScreen();

    // 显示标题
    displayHeader(platform, options.interval, options.mode);

    // 根据模式显示内容
    displayByMode(options.mode, modelData, toolData, quotaData);

    console.log('');
    console.log(`${colors.dim}按 Ctrl+C 退出${colors.reset}`);

  } catch (error) {
    clearScreen();
    console.log(`${colors.red}获取数据失败:${colors.reset} ${(error as Error).message}`);
    console.log(`${colors.dim}将在 ${options.interval} 秒后重试...${colors.reset}`);
  }
};

/**
 * 判断是否为简化模式（token 相关模式）
 */
const isSimpleMode = (options: Options): boolean => {
  const simpleModes = [
    'token',
    'token-full',
    'token-total',
    'token-used',
    'token-remaining',
    'token-percent',
  ] as const;
  return simpleModes.includes(options.mode as any);
};

/**
 * 获取并显示每小时数据（hourly 模式）
 */
const fetchAndDisplayHourly = async (
  authToken: string
): Promise<void> => {
  try {
    const { endpoints } = getApiEndpoints(process.env.ANTHROPIC_BASE_URL!);
    const tokens = await fetchHourlyData(endpoints, authToken);
    displayHourlyUsage(tokens);
  } catch (error) {
    process.stdout.write(`${colors.red}错误: ${(error as Error).message}${colors.reset}`);
  }
};

/**
 * 获取并打印原始数据（raw 模式）
 */
const fetchAndDisplayRaw = async (
  authToken: string
): Promise<void> => {
  try {
    const { endpoints } = getApiEndpoints(process.env.ANTHROPIC_BASE_URL!);
    const data = await fetchRawData(endpoints, authToken);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`${colors.red}错误: ${(error as Error).message}${colors.reset}`);
  }
};

/**
 * 主函数
 */
const main = async (): Promise<void> => {
  const args = process.argv.slice(2);

  // 检查帮助参数
  if (args.includes('-h') || args.includes('--help')) {
    printHelp();
    return;
  }

  // 所有可用的模式名称
  const modeNames = [
    'token',
    'token-full',
    'token-total',
    'token-used',
    'token-remaining',
    'token-percent',
    'hourly',
    'raw',
    'full',
  ];

  let authToken: string;
  let baseUrl: string;
  let platform: string;

  // 先解析参数（parseArgs 会识别模式名）
  const options = parseArgs();

  // 如果没有 -m 参数，检查第一个参数是否是 token（不是模式名）
  const firstArg = args[0];
  const hasTokenInEnv = process.env.ANTHROPIC_AUTH_TOKEN;
  const firstArgIsMode = firstArg && modeNames.includes(firstArg);
  const hasModeOption = args.includes('-m') || args.includes('--mode');

  // 只有当：环境变量无 token AND 第一个参数不是模式名 AND 没有指定 -m 选项
  if (firstArg && !firstArg.startsWith('-') && !hasTokenInEnv && !firstArgIsMode && !hasModeOption) {
    // 第一个参数是 token
    authToken = firstArg;
    baseUrl = 'https://api.z.ai/api/anthropic';
    if (process.env.ANTHROPIC_BASE_URL) {
      baseUrl = process.env.ANTHROPIC_BASE_URL;
    }
    ({ platform } = getApiEndpoints(baseUrl));
  } else {
    // 从环境变量读取
    ({ baseUrl, authToken } = readEnv());
    ({ platform } = getApiEndpoints(baseUrl));
  }

  // hourly 模式：只输出一次逗号分隔的数据
  if (options.mode === 'hourly') {
    await fetchAndDisplayHourly(authToken);
    return;
  }

  // raw 模式：打印完整 API 响应
  if (options.mode === 'raw') {
    await fetchAndDisplayRaw(authToken);
    return;
  }

  // full 模式：完整数据可视化展示
  if (options.mode === 'full') {
    const { endpoints } = getApiEndpoints(baseUrl);
    const rawData = await fetchRawData(endpoints, authToken);
    displayFull(rawData);
    return;
  }

  // 简化模式（token 相关模式）
  if (isSimpleMode(options)) {
    // 如果设置了 -i 参数，则循环刷新；否则只输出一次
    if (options.intervalSet) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      while (true) {
        await fetchAndDisplaySimple(options, authToken);
        await delay(options.interval * 1000);
      }
    } else {
      await fetchAndDisplaySimple(options, authToken);
    }
    return;
  }

  // 完整模式
  console.log(`${colors.green}已连接到: ${platform}${colors.reset}`);

  if (options.once) {
    await fetchAndDisplay(options, platform, authToken);
    return;
  }

  // 循环刷新
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    await fetchAndDisplay(options, platform, authToken);
    await delay(options.interval * 1000);
  }
};

// 运行
main().catch((error) => {
  console.error(`${colors.red}程序异常退出:${colors.reset}`, error);
  process.exit(1);
});
