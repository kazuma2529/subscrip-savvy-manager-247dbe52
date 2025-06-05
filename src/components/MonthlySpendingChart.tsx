
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Subscription {
  id: number;
  name: string;
  price: number;
  category: string;
  cardName: string;
  nextPayment: string;
  isTrialPeriod?: boolean;
}

interface MonthlySpendingChartProps {
  subscriptions: Subscription[];
}

const COLORS = {
  'AI': '#8b5cf6',
  '音楽': '#ec4899',
  '趣味': '#10b981',
  'ビジネス': '#3b82f6',
  'エンタメ': '#ef4444',
  '英語': '#f59e0b',
  'その他': '#6b7280',
};

const MonthlySpendingChart: React.FC<MonthlySpendingChartProps> = ({ subscriptions }) => {
  const categoryData = subscriptions.reduce((acc, sub) => {
    const category = sub.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += sub.price;
    return acc;
  }, {} as { [key: string]: number });

  const chartData = Object.entries(categoryData).map(([category, amount]) => ({
    name: category,
    value: amount,
    color: COLORS[category as keyof typeof COLORS] || COLORS['その他'],
  }));

  const totalSpend = subscriptions.reduce((total, sub) => total + sub.price, 0);

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white">月額支出内訳</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`¥${value.toLocaleString()}`, '月額']}
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-slate-300">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-white">
                ¥{item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex justify-between items-center">
            <span className="text-white font-semibold">合計</span>
            <span className="text-lg font-bold text-white">
              ¥{totalSpend.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlySpendingChart;
