import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';

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
  const { monthlySpending, loading } = usePaymentHistory();

  // 月の表示名を生成する関数
  const getMonthName = (monthString: string) => {
    const [year, month] = monthString.split('-');
    return `${parseInt(month)}月`;
  };

  // チャート用データを変換
  const chartData = monthlySpending.map(data => ({
    ...data,
    monthName: getMonthName(data.month),
  }));

  const selectedMonthData = selectedMonth 
    ? monthlySpending.find(data => data.month === selectedMonth)
    : null;

  const categoryBreakdown = selectedMonthData 
    ? Object.entries(selectedMonthData.categories).map(([category, amount]) => ({
        name: category,
        value: amount,
        color: COLORS[category as keyof typeof COLORS] || COLORS['その他'],
      }))
    : [];

  const totalYearlySpend = monthlySpending.reduce((total, month) => total + month.total, 0);
  const averageMonthlySpend = monthlySpending.length > 0 
    ? Math.round(totalYearlySpend / monthlySpending.length) 
    : 0;
  const maxSpend = monthlySpending.length > 0 
    ? Math.max(...monthlySpending.map(d => d.total))
    : 0;
  const maxSpendMonth = monthlySpending.find(d => d.total === maxSpend);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">支払い履歴を読み込み中...</p>
        </div>
      </div>
    );
  }

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

        {monthlySpending.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">まだ支払い履歴がありません</h3>
              <p className="text-slate-300 mb-4">
                サブスクリプションを追加すると、支払い履歴が自動で記録され、月別の支出分析が表示されます。
              </p>
              <Link to="/">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  サブスクリプションを追加する
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">総支出</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">¥{totalYearlySpend.toLocaleString()}</div>
                  <p className="text-xs text-slate-300">
                    過去{monthlySpending.length}ヶ月間の合計
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
                    {monthlySpending.length}ヶ月間の平均値
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
                    ¥{maxSpend.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-300">
                    {maxSpendMonth ? getMonthName(maxSpendMonth.month) : '-'}
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
                          <BarChart data={chartData}>
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
                          <LineChart data={chartData}>
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
                              activeDot={{ r: 8, stroke: '#8b5cf6' }}
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
                      {selectedMonth ? `${getMonthName(selectedMonth)}の内訳` : '月を選択してください'}
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
                      {monthlySpending.slice().reverse().map((month) => (
                        <div 
                          key={month.month}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                            selectedMonth === month.month 
                              ? 'bg-purple-500/30' 
                              : 'hover:bg-white/5'
                          }`}
                          onClick={() => setSelectedMonth(month.month)}
                        >
                          <span className="text-slate-300">{getMonthName(month.month)}</span>
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
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlySpending;
