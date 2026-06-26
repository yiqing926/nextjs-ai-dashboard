import { DailyMetrics } from '@/app/type/analytics';
import { NextResponse } from 'next/server';

// 模拟数据获取逻辑
// 在实际应用中，这通常会涉及到从数据库、API 或其他数据源获取数据。这里我们使用 Mock 数据来简化示例。

export async function GET() {
  try {
    // 模拟从数据库或第三方服务查询数据的 1 秒延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 构造符合 DailyMetrics 接口的 Mock 数据
    const mockData: DailyMetrics[] = [
      { date: '06-15', revenue: 4000, activeUsers: 2400, conversionRate: 2.4 },
      { date: '06-16', revenue: 3000, activeUsers: 1398, conversionRate: 2.1 },
      { date: '06-17', revenue: 2000, activeUsers: 9800, conversionRate: 2.9 },
      { date: '06-18', revenue: 2780, activeUsers: 3908, conversionRate: 2.0 },
      { date: '06-19', revenue: 1890, activeUsers: 4800, conversionRate: 1.8 },
      { date: '06-20', revenue: 2390, activeUsers: 3800, conversionRate: 2.2 },
      { date: '06-21', revenue: 3490, activeUsers: 4300, conversionRate: 2.5 },
    ];

    // 计算 KPI 核心指标（总收入、平均活跃用户、平均转化率）
    const totalRevenue = mockData.reduce((sum, item) => sum + item.revenue, 0);
    const avgActiveUsers = Math.round(
      mockData.reduce((sum, item) => sum + item.activeUsers, 0) / mockData.length
    );
    const avgConversionRate = parseFloat(
      (mockData.reduce((sum, item) => sum + item.conversionRate, 0) / mockData.length).toFixed(2)
    );

    // 返回整合后的数据
    return NextResponse.json({
      summary: {
        totalRevenue,
        avgActiveUsers,
        avgConversionRate,
      },
      chartData: mockData,
    });
  } catch (err) {
    console.error('Error fetching analytics data:', err);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}