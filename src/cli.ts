#!/usr/bin/env bun
/**
 * GLM Coding Plan Usage Monitor
 * 实时监控 GLM Coding Plan 的使用情况
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
import { displayByMode, displayFull, displayHeader, displayHourlyUsage, displayTokenFull, displayTokenSimple } from './display.js';

/**
 * 获取数据并显示（简化模式 - 默认 token 模式）
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

    // 简化显示：只打印百分比，使用 \r 回到行首
    displayTokenSimple(quotaData);

  } catch (error) {
    process.stdout.write(`\r${colors.red}错误: ${(error as Error).message}${colors.reset}  `);
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
 * 判断是否为简化模式（默认 token 模式且非 once）
 */
const isSimpleMode = (options: Options): boolean => {
  return options.mode === 'token' && !options.once;
};

/**
 * 获取并显示 token-full 数据
 */
const fetchAndDisplayTokenFull = async (
  authToken: string
): Promise<void> => {
  try {
    const { endpoints } = getApiEndpoints(process.env.ANTHROPIC_BASE_URL!);
    const { quotaData } = await fetchAllData(endpoints, authToken, '', '');
    displayTokenFull(quotaData);
  } catch (error) {
    process.stdout.write(`${colors.red}错误: ${(error as Error).message}${colors.reset}`);
  }
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

  const options = parseArgs();
  const { baseUrl, authToken } = readEnv();
  const { platform } = getApiEndpoints(baseUrl);

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
    const { endpoints } = getApiEndpoints(process.env.ANTHROPIC_BASE_URL!);
    const rawData = await fetchRawData(endpoints, authToken);
    displayFull(rawData);
    return;
  }

  // token-full 模式：显示已用/总额/剩余/百分比
  if (options.mode === 'token-full') {
    await fetchAndDisplayTokenFull(authToken);
    return;
  }

  // 简化模式
  if (isSimpleMode(options)) {
    // 循环刷新
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      await fetchAndDisplaySimple(options, authToken);
      await delay(options.interval * 1000);
    }
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
