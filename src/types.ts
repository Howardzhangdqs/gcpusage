/**
 * 类型定义
 */

// 显示模式
export type DisplayMode = 'token' | 'token-full' | 'hourly' | 'raw' | 'full';

// 命令行选项
export interface Options {
  mode: DisplayMode;
  interval: number;
  once: boolean;
}

// 配额限制项
export interface QuotaLimit {
  type: string;
  percentage: number;
  currentValue?: number;
  usage?: number;
  remaining?: number;
  usageDetails?: UsageDetail[];
}

// 使用详情
export interface UsageDetail {
  toolName: string;
  count: number;
}

// 配额响应
export interface QuotaResponse {
  data?: {
    limits: QuotaLimit[];
  };
  limits?: QuotaLimit[];
}

// 模型使用数据
export interface ModelUsage {
  modelName: string;
  usageCount: number;
  totalTokens: number;
}

// 工具使用数据
export interface ToolUsage {
  toolName?: string;
  name?: string;
  count: number;
}

// API 响应
export interface ApiResponse<T> {
  data?: T;
}

// API 端点
export interface ApiEndpoints {
  modelUsage: string;
  toolUsage: string;
  quotaLimit: string;
}

// 颜色代码
export interface Colors {
  reset: string;
  bright: string;
  dim: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
}
