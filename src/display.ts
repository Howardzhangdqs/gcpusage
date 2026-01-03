/**
 * 显示模块
 */

import Table from 'cli-table3';
import type { DisplayMode, ModelUsage, QuotaLimit, ToolUsage } from './types.js';
import { colors } from './utils.js';

/**
 * 获取 Token 限制信息
 */
export const getTokenLimitInfo = (quotaData: { limits?: QuotaLimit[] }) => {
  if (!quotaData?.limits) return null;
  return quotaData.limits.find(item => item.type === 'TOKENS_LIMIT') || null;
};

/**
 * 获取 Token 通量百分比（准确计算）
 */
export const getTokenPercentage = (quotaData: { limits?: QuotaLimit[] }): number => {
  const limit = getTokenLimitInfo(quotaData);
  if (!limit || !limit.usage) return 0;
  const currentValue = limit.currentValue || 0;
  return Math.max(Math.min(currentValue / limit.usage * 100, 100), 0);
};

/**
 * 格式化数字：如果超过100万显示M，否则显示完整数字
 */
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  return `${num.toLocaleString()}`;
};

/**
 * 显示 Token 百分比（token 模式）
 */
export const displayTokenSimple = (quotaData: { limits?: QuotaLimit[] }): void => {
  const percentage = getTokenPercentage(quotaData);
  console.log(percentage.toFixed(2));
};

/**
 * 显示 Token 完整信息（token-full 模式）
 */
export const displayTokenFull = (quotaData: { limits?: QuotaLimit[] }): void => {
  const limit = getTokenLimitInfo(quotaData);
  if (!limit) {
    console.log('暂无数据');
    return;
  }

  const used = limit.currentValue || 0;
  const total = limit.usage || 0;
  const remaining = limit.remaining || 0;
  const percentage = Math.max(Math.min(used / total * 100, 100), 0);

  console.log(`${formatNumber(used)},${formatNumber(total)},${formatNumber(remaining)},${percentage.toFixed(2)}%`);
};

/**
 * 显示 Token 总量（token-total 模式）
 */
export const displayTokenTotal = (quotaData: { limits?: QuotaLimit[] }): void => {
  const limit = getTokenLimitInfo(quotaData);
  if (!limit) {
    console.log('暂无数据');
    return;
  }
  console.log(formatNumber(limit.usage || 0));
};

/**
 * 显示已用 Token（token-used 模式）
 */
export const displayTokenUsed = (quotaData: { limits?: QuotaLimit[] }): void => {
  const limit = getTokenLimitInfo(quotaData);
  if (!limit) {
    console.log('暂无数据');
    return;
  }
  console.log(formatNumber(limit.currentValue || 0));
};

/**
 * 显示剩余 Token（token-remaining 模式）
 */
export const displayTokenRemaining = (quotaData: { limits?: QuotaLimit[] }): void => {
  const limit = getTokenLimitInfo(quotaData);
  if (!limit) {
    console.log('暂无数据');
    return;
  }
  console.log(formatNumber(limit.remaining || 0));
};

/**
 * 显示 Token 百分比（token-percent 模式）
 */
export const displayTokenPercent = (quotaData: { limits?: QuotaLimit[] }): void => {
  const percentage = getTokenPercentage(quotaData);
  console.log(percentage.toFixed(2));
};

/**
 * 显示 MCP 使用情况
 */
export const displayMcpUsage = (quotaData: { limits?: QuotaLimit[] }): void => {
  if (!quotaData?.limits) {
    console.log(`${colors.yellow}暂无数据${colors.reset}`);
    return;
  }

  const mcpLimit = quotaData.limits.find(item => item.type === 'TIME_LIMIT');
  if (mcpLimit) {
    const percentage = mcpLimit.percentage || 0;
    const currentUsage = mcpLimit.currentValue || 0;
    const total = mcpLimit.usage || 0;

    console.log('');
    console.log(`${colors.bright}${colors.magenta}📦 1个月 MCP 使用情况${colors.reset}`);
    console.log(colors.dim + '─'.repeat(50) + colors.reset);
    console.log(`  ${percentage.toFixed(1)}%`);
    console.log(`  已使用: ${colors.cyan}${currentUsage}${colors.reset} / 总额: ${colors.cyan}${total}${colors.reset}`);

    if (mcpLimit.usageDetails && mcpLimit.usageDetails.length > 0) {
      console.log('');
      console.log(`  ${colors.dim}工具详情:${colors.reset}`);
      mcpLimit.usageDetails.slice(0, 5).forEach(detail => {
        const toolName = detail.toolName || 'Unknown';
        const count = detail.count || 0;
        console.log(`    • ${colors.white}${toolName}${colors.reset}: ${colors.cyan}${count}${colors.reset}`);
      });
    }
  }
};

/**
 * 显示模型使用统计
 */
export const displayModelUsage = (modelData: ModelUsage[]): void => {
  if (!Array.isArray(modelData) || modelData.length === 0) {
    console.log(`${colors.yellow}暂无数据${colors.reset}`);
    return;
  }

  const sorted = [...modelData].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

  console.log(`${colors.cyan}🤖 模型使用统计 (近24小时)${colors.reset}`);

  const table = new Table({
    head: ['模型', '调用次数', 'Token'],
    colWidths: [30, 15, 20],
    style: {
      head: [],
      border: ['grey'],
    },
  });

  sorted.slice(0, 10).forEach((item) => {
    const modelName = item.modelName || 'Unknown';
    const usageCount = item.usageCount || 0;
    const tokenCount = item.totalTokens || 0;
    table.push([modelName, usageCount.toLocaleString(), `${(tokenCount / 1000).toFixed(1)}K`]);
  });

  console.log(table.toString());
};

/**
 * 显示工具使用统计
 */
export const displayToolUsage = (toolData: ToolUsage[]): void => {
  if (!Array.isArray(toolData) || toolData.length === 0) {
    console.log(`${colors.yellow}暂无数据${colors.reset}`);
    return;
  }

  const sorted = [...toolData].sort((a, b) => (b.count || 0) - (a.count || 0));

  console.log(`${colors.blue}🔧 工具使用统计 (近24小时)${colors.reset}`);

  const table = new Table({
    head: ['工具', '使用次数'],
    colWidths: [40, 20],
    style: {
      head: [],
      border: ['grey'],
    },
  });

  sorted.slice(0, 10).forEach((item) => {
    const toolName = item.toolName || item.name || 'Unknown';
    const count = item.count || 0;
    table.push([toolName, count.toLocaleString()]);
  });

  console.log(table.toString());
};

/**
 * 根据模式显示对应内容
 */
export const displayByMode = (
  mode: DisplayMode,
  _modelData: ModelUsage[],
  _toolData: ToolUsage[],
  quotaData: { limits?: QuotaLimit[] },
  hourlyTokens?: number[]
): void => {
  switch (mode) {
    case 'token':
      displayTokenUsage(quotaData);
      break;
    case 'hourly':
      if (hourlyTokens) {
        displayHourlyUsage(hourlyTokens);
      }
      break;
  }
};

/**
 * 显示标题栏
 */
export const displayHeader = (platform: string, interval: number, mode: DisplayMode): void => {
  const now = new Date();
  console.log(`${colors.dim}平台: ${platform} | 刷新: ${now.toLocaleString('zh-CN', { hour12: false })} | 间隔: ${interval}s | 模式: ${mode}${colors.reset}`);
  console.log('');
};

/**
 * 显示近24小时每小时 Token 使用量
 */
export const displayHourlyUsage = (tokens: number[]): void => {
  console.log(tokens.join(','));
};

/**
 * 显示完整数据（full 模式）
 */
export const displayFull = (rawData: Record<string, unknown>): void => {
  const data = rawData as {
    modelUsage?: { data?: { x_time?: string[]; tokensUsage?: (number | null)[]; modelCallCount?: (number | null)[]; totalUsage?: { totalModelCallCount?: number; totalTokensUsage?: number } } };
    toolUsage?: { data?: { x_time?: string[]; networkSearchCount?: (number | null)[]; totalUsage?: { totalNetworkSearchCount?: number; toolDetails?: { modelName: string; totalUsageCount: number }[] } } };
    quotaLimit?: { data?: { limits?: { type: string; percentage: number; currentValue?: number; usage?: number; remaining?: number; nextResetTime?: number }[] } };
  };

  // ========== 1. 配额限制 ==========
  const limits = data.quotaLimit?.data?.limits || [];

  console.log(`${colors.cyan}配额限制${colors.reset}`);

  const quotaTable = new Table({
    head: ['类型', '进度', '已用', '总额', '剩余', '重置时间'],
    // colWidths: [20, 10],
    wordWrap: true,
    style: {
      head: [],
      border: ['grey'],
    },
  });

  limits.reverse().forEach((limit) => {
    const isToken = limit.type === 'TOKENS_LIMIT';
    const label = isToken ? '📊 5小时 Token' : '📦 1个月 MCP';
    const percentage = Math.max(Math.min((limit.currentValue || 0) / limit.usage! * 100 || 0, 100), 0).toFixed(2) + "%";
    const used = isToken ? `${((limit.currentValue || 0) / 1000000).toFixed(2)}M` : `${limit.currentValue}`;
    const total = isToken ? `${(limit.usage! / 1000000).toFixed(0)}M` : `${limit.usage}`;
    const remaining = isToken ? `${(limit.remaining! / 1000000).toFixed(2)}M` : `${limit.remaining}`;

    // 格式化重置时间
    let resetTime = '-';
    if (limit.nextResetTime) {
      const resetDate = new Date(limit.nextResetTime);
      const now = Date.now();
      const diffMs = resetDate.getTime() - now;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        resetTime = `${diffDays}天${diffHours % 24}时后`;
      } else if (diffHours > 0) {
        resetTime = `${diffHours}时${diffMins % 60}分后`;
      } else if (diffMins > 0) {
        resetTime = `${diffMins}分钟后`;
      } else if (diffMins < 0) {
        resetTime = '已过期';
      }
    }

    quotaTable.push([label, percentage, used, total, remaining, resetTime]);
  });

  console.log(quotaTable.toString());
  console.log('');

  // ========== 2. 总计 ==========
  const totalModel = data.modelUsage?.data?.totalUsage;
  const totalTool = data.toolUsage?.data?.totalUsage;

  console.log(`${colors.green}总计 (24小时)${colors.reset}`);

  const totalTable = new Table({
    head: ['项目', '数值'],
    // colWidths: [20, 30],
    style: {
      head: [],
      border: ['grey'],
    },
  });

  if (totalModel) {
    totalTable.push(['模型调用', `${(totalModel.totalModelCallCount || 0).toLocaleString()} 次`]);
    totalTable.push(['Token 用量', `${((totalModel.totalTokensUsage || 0) / 1000000).toFixed(2)}M`]);
  }
  if (totalTool) {
    totalTable.push(['搜索调用', `${(totalTool.totalNetworkSearchCount || 0).toLocaleString()} 次`]);
  }

  console.log(totalTable.toString());
  console.log('');

  // ========== 3. 24小时 Token 用量表格 ==========
  const times = data.modelUsage?.data?.x_time || [];
  const tokens = data.modelUsage?.data?.tokensUsage || [];

  console.log(`${colors.yellow}24小时 Token 用量${colors.reset}`);

  const tokenTable = new Table({
    head: ['时间', '用量 (Tokens)'],
    // colWidths: [18, 15],
    style: {
      head: [],
      border: ['grey'],
    },
  });

  // 格式化时间范围为 HH:00-HH:00 格式
  const formatTimeRange = (timeStr: string): string => {
    const timePart = timeStr.split(' ')[1] || '--:--';
    const hourStr = timePart.split(':')[0];
    const hour = parseInt(hourStr, 10);
    if (isNaN(hour)) return '--:--';

    const prevHour = (hour + 23) % 24; // 前一小时
    const formatHour = (h: number) => String(h).padStart(2, '0');
    return `${formatHour(prevHour)}:00 - ${formatHour(hour)}:00`;
  };

  for (let i = 0; i < times.length; i++) {
    const time = times[i] || '';
    const token = tokens[i];
    const timeRange = formatTimeRange(time);

    if (token === null) {
      tokenTable.push([timeRange, '-']);
    } else {
      // 每三位数加逗号
      const tokenK = `${token}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      tokenTable.push([timeRange, tokenK]);
    }
  }

  const tableLines = tokenTable.toString().split('\n');

  console.log(tableLines.filter((_line, index) =>
    index <= 2 || index % 2 == 1 || index == tableLines.length - 1
  ).join('\n'));
  console.log('');

  // ========== 4. 工具使用详情 ==========
  if (totalTool?.toolDetails && totalTool.toolDetails.length > 0) {
    console.log(`${colors.blue}工具使用详情${colors.reset}`);

    const toolTable = new Table({
      head: ['工具', '次数'],
      colWidths: [30, 15],
      style: {
        head: [],
        border: ['grey'],
      },
    });

    totalTool.toolDetails.forEach((detail) => {
      toolTable.push([detail.modelName, `${detail.totalUsageCount}`]);
    });

    console.log(toolTable.toString());
  }
};
