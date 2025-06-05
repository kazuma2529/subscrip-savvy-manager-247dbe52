
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';

interface Subscription {
  id: number;
  name: string;
  price: number;
  category: string;
  cardName: string;
  nextPayment: string;
  isTrialPeriod?: boolean;
  trialEndDate?: string;
}

interface UpcomingPaymentsProps {
  subscriptions: Subscription[];
}

const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({ subscriptions }) => {
  const today = new Date();
  
  const upcomingPayments = subscriptions
    .map(sub => {
      const paymentDate = new Date(sub.nextPayment);
      const daysUntil = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...sub, daysUntil };
    })
    .filter(sub => sub.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  const getUrgencyColor = (days: number) => {
    if (days <= 1) return 'bg-red-500';
    if (days <= 3) return 'bg-orange-500';
    if (days <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          支払い予定
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingPayments.length === 0 ? (
            <p className="text-slate-300 text-sm text-center py-4">
              今後30日間の支払い予定はありません
            </p>
          ) : (
            upcomingPayments.map(sub => (
              <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${getUrgencyColor(sub.daysUntil)}`}></div>
                    <p className="text-white font-medium truncate">{sub.name}</p>
                    {sub.isTrialPeriod && (
                      <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-slate-300 text-sm">¥{sub.price.toLocaleString()}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      sub.daysUntil <= 3 
                        ? 'border-orange-400 text-orange-300' 
                        : 'border-slate-600 text-slate-300'
                    }`}
                  >
                    {sub.daysUntil === 0 ? '今日' : 
                     sub.daysUntil === 1 ? '明日' : 
                     `${sub.daysUntil}日後`}
                  </Badge>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(sub.nextPayment).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingPayments;
