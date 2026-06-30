'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Loader2, DollarSign, Users, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';
import { DailyMetrics } from '../type/analytics';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

interface DashboardData {
  summary: { totalRevenue: number; avgActiveUsers: number; avgConversionRate: number };
  chartData: DailyMetrics[];
}

// 对应 Python 返回的强类型接口
interface AIResponse {
  summary_verdict: string;
  deep_dive: string[];
  action_plan: string[];
  highlight_date: string | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const t = useTranslations('Dashboard'); // 绑定 json 里的命名空间
  const locale = useLocale();

  // AI 交互相关状态
  const [question, setQuestion] = useState<string>(t('defaultPrompt'));
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();

  // 🌍 语言切换函数：直接替换 URL 中的语言前缀
  const switchLanguage = (lang: 'zh' | 'en') => {
    // 例如从 /zh/dashboard 变成 /en/dashboard
    const newPath = pathname.replace(/^\/(zh|en)/, `/${lang}`);
    router.push(newPath);
  };

  useEffect(() => {
    // 🟢 正确：在内部直接使用上面已经拿到的变量 locale
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics?locale=${locale}`);
        if (!response.ok) throw new Error('网络请求失败');
        const result = await response.json();
        setData(result);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '加载数据时出错');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [locale]);

  // 触发 AI 分析的点击事件
  const handleAIQuery = async () => {
    if (!data || !question.trim()) return;
    try {
      setAiLoading(true);
      const res = await fetch(`/api/ai?locale=${locale}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: question, currentData: data.chartData }),
      });
      if (!res.ok) throw new Error('AI 分析请求未成功响应');
      const result = await res.json();
      setAiResult(result);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'AI 诊断失败');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t('loadingData')}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-red-500">
        <p>数据加载失败: {error || '未知错误'}</p>
      </div>
    );
  }

  const { summary, chartData } = data;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <button 
          onClick={() => switchLanguage('zh')} 
          className={`px-3 py-1 border rounded ${locale === 'zh' ? 'bg-blue-600 text-white' : 'bg-white'}`}
        >
          中文
        </button>
        <button 
         onClick={() => switchLanguage('en')} 
         className={`px-3 py-1 border rounded ${locale === 'en' ? 'bg-blue-600 text-white' : 'bg-white'}`}
        >
          English
        </button>
      </div>

      {/* KPI 卡片区 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('kpiRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('kpiUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{summary.avgActiveUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('kpiConversionRate')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgConversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* 图表展示区 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader><CardTitle className="text-base font-semibold">{t('dailyIncomeTrend')}</CardTitle></CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader><CardTitle className="text-base font-semibold">{t('userBehaviorTrend')}</CardTitle></CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#888888" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickFormatter={(v) => `${v}%`} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="activeUsers" stroke="#16a34a" name={t('activeUserLabel')} strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#ea580c" name={t('conversionRateLabel')} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 第四步核心 UI：AI 智能诊断交互组件 */}
      <Card className="border-blue-100 bg-slate-50/50 shadow-sm dark:border-slate-800 dark:bg-slate-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
            <CardTitle className="text-lg">{t('dignosisBtn')}</CardTitle>
          </div>
          <CardDescription>{t('aiDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="向 AI 提问有关上方数据的指标..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2"
            />
            <Button onClick={handleAIQuery} disabled={aiLoading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {aiLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('diagnosisLoading')}
                </>
              ) : (t('analyzeBtn'))}
            </Button>
          </div>

          {/* AI 诊断结果呈现面板 */}
          {aiResult && (
            <div className="mt-4 rounded-lg border bg-background p-5 space-y-4 shadow-inner">
              {aiResult.highlight_date && (
                <div className="flex items-center gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    <strong>{t('dataFluctuationWarning')}</strong>
                    {t('aiFind')}
                    <strong className="text-red-600 mx-1">{aiResult.highlight_date}</strong> {/* 可选：加点间距和红色加粗更明显 */}
                    {t('deviationWarning')}
                  </span>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">📊 {t('diagnosisResult')}</h4>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{aiResult.summary_verdict}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 pt-2">
                <div className="rounded-md bg-slate-50 p-4 dark:bg-slate-900">
                  <h5 className="text-sm font-bold text-blue-600 dark:text-blue-400">🕵️ {t('deepDive')}</h5>
                  <ul className="mt-2 list-disc list-inside text-xs space-y-1.5 text-muted-foreground">
                    {aiResult.deep_dive.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
                <div className="rounded-md bg-emerald-50/60 p-4 dark:bg-emerald-950/10">
                  <h5 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">🛠️ {t('actionPlan')}</h5>
                  <ul className="mt-2 list-decimal list-inside text-xs space-y-1.5 text-muted-foreground">
                    {aiResult.action_plan.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}