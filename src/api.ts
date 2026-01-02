/**
 * API 请求模块
 */

import https from 'https';
import type { ApiEndpoints } from './types.js';
import { colors } from './utils.js';

/**
 * HTTP 请求封装
 */
export const httpsRequest = <T = unknown>(
  url: string,
  authToken: string,
  queryParams = ''
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + queryParams,
      method: 'GET',
      headers: {
        'Authorization': authToken,
        'Accept-Language': 'en-US,en',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
        try {
          resolve(JSON.parse(data) as T);
        } catch (e) {
          reject(new Error(`解析响应失败: ${(e as Error).message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

/**
 * 确定平台和 API 端点
 */
export const getApiEndpoints = (baseUrl: string): { platform: string; endpoints: ApiEndpoints } => {
  const parsedBaseUrl = new URL(baseUrl);
  const baseDomain = `${parsedBaseUrl.protocol}//${parsedBaseUrl.host}`;

  let platform: string;
  let endpoints: ApiEndpoints;

  if (baseUrl.includes('api.z.ai')) {
    platform = 'Z.ai';
    endpoints = {
      modelUsage: `${baseDomain}/api/monitor/usage/model-usage`,
      toolUsage: `${baseDomain}/api/monitor/usage/tool-usage`,
      quotaLimit: `${baseDomain}/api/monitor/usage/quota/limit`,
    };
  } else if (baseUrl.includes('open.bigmodel.cn') || baseUrl.includes('dev.bigmodel.cn')) {
    platform = 'ZHIPU';
    endpoints = {
      modelUsage: `${baseDomain}/api/monitor/usage/model-usage`,
      toolUsage: `${baseDomain}/api/monitor/usage/tool-usage`,
      quotaLimit: `${baseDomain}/api/monitor/usage/quota/limit`,
    };
  } else {
    console.error(`${colors.red}错误: 无法识别的 ANTHROPIC_BASE_URL:${colors.reset}`, baseUrl);
    console.error('');
    console.error('支持的值:');
    console.error('  - https://api.z.ai/api/anthropic');
    console.error('  - https://open.bigmodel.cn/api/anthropic');
    process.exit(1);
  }

  return { platform, endpoints };
};

/**
 * 获取所有使用数据
 */
export const fetchAllData = async (
  endpoints: ApiEndpoints,
  authToken: string,
  startTime: string,
  endTime: string
) => {
  const queryParams = `?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;

  const [modelRes, toolRes, quotaRes] = await Promise.all([
    httpsRequest(endpoints.modelUsage, authToken, queryParams),
    httpsRequest(endpoints.toolUsage, authToken, queryParams),
    httpsRequest(endpoints.quotaLimit, authToken, ''),
  ]);

  return {
    modelData: (modelRes as any).data || modelRes,
    toolData: (toolRes as any).data || toolRes,
    quotaData: (quotaRes as any).data || quotaRes,
  };
};

/**
 * 获取近24小时每小时的 Token 使用量
 */
export const fetchHourlyData = async (
  endpoints: ApiEndpoints,
  authToken: string
): Promise<number[]> => {
  const now = new Date();
  const hours: number[] = [];

  // 获取过去24小时，每小时的数据
  const requests = [];
  for (let i = 23; i >= 0; i--) {
    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - i, 0, 0, 0);
    const hourEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - i, 59, 59, 999);

    const formatDateTime = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${h}:${minutes}:${seconds}`;
    };

    const startTime = formatDateTime(hourStart);
    const endTime = formatDateTime(hourEnd);
    const queryParams = `?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;

    requests.push(
      httpsRequest(endpoints.modelUsage, authToken, queryParams).then((res: any) => {
        const data = res.data || res;
        if (Array.isArray(data)) {
          // 累加所有模型的 totalTokens
          return data.reduce((sum: number, item: any) => sum + (item.totalTokens || 0), 0);
        }
        return 0;
      }).catch(() => 0)
    );
  }

  return Promise.all(requests);
};

/**
 * 获取所有原始 API 响应
 */
export const fetchRawData = async (
  endpoints: ApiEndpoints,
  authToken: string
): Promise<Record<string, unknown>> => {
  const { startTime, endTime } = (await import('./utils.js')).getTimeRange();
  const queryParams = `?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;

  const [modelRes, toolRes, quotaRes] = await Promise.all([
    httpsRequest(endpoints.modelUsage, authToken, queryParams),
    httpsRequest(endpoints.toolUsage, authToken, queryParams),
    httpsRequest(endpoints.quotaLimit, authToken, ''),
  ]);

  return {
    modelUsage: modelRes,
    toolUsage: toolRes,
    quotaLimit: quotaRes,
  };
};
