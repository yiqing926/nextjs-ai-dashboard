export interface DailyMetrics {
  date: string;
  revenue: number;
  activeUsers: number;
 conversionRate: number;
} 

// 定义前端状态接口
export interface DashboardData {
  summary: {
    totalRevenue: number;
    avgActiveUsers: number;
    avgConversionRate: number;
  };
  chartData: DailyMetrics[];
}