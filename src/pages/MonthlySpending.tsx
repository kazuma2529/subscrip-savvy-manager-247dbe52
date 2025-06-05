
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';

// Mock data for demonstration - this would come from subscription payment history
const mockMonthlyData = [
  { month: '2024-09', monthName: '9月', total: 15738, categories: { 'AI': 2000, 'エンタメ': 1490, 'ビジネス': 6248, '音楽': 980, '英語': 2980, 'その他': 2040 } },
  { month: '2024-10', monthName: '10月', total: 18228, categories: { 'AI': 2000, 'エンタメ': 1490, 'ビジネス': 6248, '音楽': 980, '英語': 2980, 'その他': 4530 } },
  { month: '2024-11', monthName: '11月', total: 16718, categories: { 'AI': 2000, 'エンタメ': 1490, 'ビジネス': 6248, '音楽': 980, '英語': 2980, 'その他': 3020 } },
  { month: '2024-12', monthName: '12月', total: 19738, categories: { 'AI': 4000, 'エンタメ': 1490, 'ビジネス': 6248, '音楽': 980, '英語': 2980, 'その他': 4040 } },
  { month: '2025-01', monthName: '1月', total: 17238, categories: { 'AI': 2000, 'エンタメ': 2980, 'ビジネス': 6248, '音楽': 980, '英語': 2980, 'その他': 2050 } },
  { month: '2025-02', monthName: '2月', total: 15738, categories: { 'AI': 2000, 'エンタメ': 1490, 'ビジネス': 6248, '音楽': 980, '英語': 2980, 'その他': 2040 } },
  { month: '2025-03', monthName: '3月', total: 20248, categories: { 'AI': 2000, 'エンタメ': 1490, 'ビジネス': 9248, '音楽': 980, '英語': 2980, 'その他': 3550 } },
  { month: '2025-04', monthName: '4月', total: 16738, categories: { 'AI': 2000, 'エンタメ': 1490, 'ビジネス': 6248, '音楽': 980, '英語': 2980, 'その他': 3040 } },
  { month: '2025-05', monthName: '5月', total: 18238, categories: { 'AI': 2000, 'エンタメ': 1490, 'ビジネス': 6248, '音楽': 1980, '英語': 2980, 'その他': 3540 } },
  { month: '2025-06', monthName: '6月', total: 17738, categories: { 'AI': 2000, 'エンタメ': 1490, 'ビジネス': 6248, '音楽': 980, '英語': 2980, 'その他': 4040 } },
];

const COLORS = {
  'AI': '#8b5cf6',
  '音楽': '#ec4899',
  '趣味': '#10b981',
  'ビジネス': '#3b82f6',
  'エンタメ': '#ef4444',
  '英語': '#f59e0b',
  'その他': '#6b7280',
};

const chartConfig = {
  total: {
    label: "月額支出",
    color: "#8b5cf6",
  },
};

const MonthlySpending = () => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const selectedMonthData = selectedMonth 
    ? mockMonthlyData.find(data => data.month === selectedMonth)
    : null;

  const categoryBreakdown = selectedMonthData 
    ? Object.entries(selectedMonthData.categories).map(([category, amount]) => ({
        name: category,
        value: amount,
        color: COLORS[category as keyof typeof COLORS] || COLORS['その他'],
      }))
    : [];

  const totalYearlySpend = mockMonthlyData.reduce((total, month) => total + month.total, 0);
  const averageMonthlySpend = Math.round(totalYearlySpend / mockMonthlyData.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="text-black bg-white border-white/30 hover:bg-white/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">月別支出分析</h1>
              <p className="text-slate-300">サブスクリプション支出の推移を確認</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">年間総支出</CardTitle>
              <Calendar className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">¥{totalYearlySpend.toLocaleString()}</div>
              <p className="text-xs text-slate-300">
                過去10ヶ月間の合計
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">月平均支出</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">¥{averageMonthlySpend.toLocaleString()}</div>
              <p className="text-xs text-slate-300">
                10ヶ月間の平均値
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">最高支出月</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ¥{Math.max(...mockMonthlyData.map(d => d.total)).toLocaleString()}
              </div>
              <p className="text-xs text-slate-300">
                {mockMonthlyData.find(d => d.total === Math.max(...mockMonthlyData.map(d => d.total)))?.monthName}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Controls */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
            className={chartType === 'bar' 
              ? "bg-purple-500 hover:bg-purple-600 text-white" 
              : "text-black border-white/30 hover:bg-white/10 hover:text-white bg-white"
            }
          >
            棒グラフ
          </Button>
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
            className={chartType === 'line' 
              ? "bg-purple-500 hover:bg-purple-600 text-white" 
              : "text-black border-white/30 hover:bg-white/10 hover:text-white bg-white"
            }
          >
            線グラフ
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">月別支出推移</CardTitle>
                <p className="text-slate-300 text-sm">月をクリックすると詳細な内訳を表示します</p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart data={mockMonthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="monthName" 
                          tick={{ fill: 'white', fontSize: 12 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                        />
                        <YAxis 
                          tick={{ fill: 'white', fontSize: 12 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                          tickFormatter={(value) => `¥${value.toLocaleString()}`}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          formatter={(value: number) => [`¥${value.toLocaleString()}`, '支出額']}
                        />
                        <Bar 
                          dataKey="total" 
                          fill="#8b5cf6" 
                          radius={[4, 4, 0, 0]}
                          onClick={(data) => setSelectedMonth(data.month)}
                          className="cursor-pointer hover:opacity-80"
                        />
                      </BarChart>
                    ) : (
                      <LineChart data={mockMonthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="monthName" 
                          tick={{ fill: 'white', fontSize: 12 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                        />
                        <YAxis 
                          tick={{ fill: 'white', fontSize: 12 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                          tickFormatter={(value) => `¥${value.toLocaleString()}`}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          formatter={(value: number) => [`¥${value.toLocaleString()}`, '支出額']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8, onClick: (data: any) => setSelectedMonth(data.payload.month) }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Category Breakdown */}
          <div>
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">
                  {selectedMonth ? `${selectedMonthData?.monthName}の内訳` : '月を選択してください'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedMonthData ? (
                  <div className="space-y-4">
                    <div className="text-2xl font-bold text-white mb-4">
                      ¥{selectedMonthData.total.toLocaleString()}
                    </div>
                    <div className="space-y-3">
                      {categoryBreakdown.map((category) => (
                        <div key={category.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="text-sm text-slate-300">{category.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-white">
                            ¥{category.value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMonth(null)}
                        className="text-black bg-white border-white/30 hover:bg-white/90 px-4"
                      >
                        選択解除
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-300 text-center py-8">
                    グラフの月をクリックすると、その月のカテゴリ別内訳を表示します
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Monthly List */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mt-6">
              <CardHeader>
                <CardTitle className="text-white">月別一覧</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {mockMonthlyData.slice().reverse().map((month) => (
                    <div 
                      key={month.month}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        selectedMonth === month.month 
                          ? 'bg-purple-500/30' 
                          : 'hover:bg-white/5'
                      }`}
                      onClick={() => setSelectedMonth(month.month)}
                    >
                      <span className="text-slate-300">{month.monthName}</span>
                      <span className="text-white font-semibold">
                        ¥{month.total.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlySpending;
