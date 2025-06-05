
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

interface Subscription {
  id: number;
  name: string;
  price: number;
  category: string;
  cardName: string;
  nextPayment: string;
  isTrialPeriod: boolean;
  trialEndDate?: string;
}

interface CalendarViewProps {
  subscriptions: Subscription[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ subscriptions }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 今月の支払い予定を取得
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const thisMonthPayments = subscriptions.filter(sub => {
    const paymentDate = new Date(sub.nextPayment);
    return paymentDate >= startOfMonth && paymentDate <= endOfMonth;
  });

  // 日付ごとの支払いをグループ化
  const getPaymentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return thisMonthPayments.filter(sub => {
      const paymentDateStr = new Date(sub.nextPayment).toISOString().split('T')[0];
      return paymentDateStr === dateStr;
    });
  };

  // カレンダーに支払い日をマーク
  const paymentDates = thisMonthPayments.map(sub => new Date(sub.nextPayment));

  const modifiers = {
    payment: paymentDates,
  };

  const modifiersStyles = {
    payment: {
      backgroundColor: '#f97316',
      color: 'white',
      borderRadius: '50%',
      fontWeight: 'bold',
    },
  };

  return (
    <>
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/15 transition-colors">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">今月の支払い</CardTitle>
                <CalendarIcon className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">{thisMonthPayments.length}</div>
                  <p className="text-xs text-slate-300 mb-4">
                    3日以内に支払い予定
                  </p>
                  <div className="bg-white/20 rounded-lg p-4">
                    <p className="text-white font-medium mb-2">カレンダービューで見る</p>
                    <div className="bg-white/10 rounded p-2">
                      <div className="grid grid-cols-7 gap-1 text-xs text-white/70">
                        <div>日</div>
                        <div>月</div>
                        <div>火</div>
                        <div>水</div>
                        <div>木</div>
                        <div>金</div>
                        <div>土</div>
                      </div>
                      <div className="grid grid-cols-7 gap-1 mt-2">
                        {Array.from({ length: 35 }, (_, i) => {
                          const date = new Date(startOfMonth);
                          date.setDate(date.getDate() - startOfMonth.getDay() + i);
                          const isCurrentMonth = date.getMonth() === now.getMonth();
                          const hasPayment = getPaymentsForDate(date).length > 0;
                          
                          return (
                            <div
                              key={i}
                              className={`text-xs h-6 w-6 flex items-center justify-center rounded ${
                                isCurrentMonth 
                                  ? hasPayment 
                                    ? 'bg-orange-500 text-white font-bold'
                                    : 'text-white/70'
                                  : 'text-white/30'
                              }`}
                            >
                              {date.getDate()}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">今月の支払いカレンダー</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              <div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  className="rounded-md border pointer-events-auto"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {selectedDate ? 
                    `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日の支払い` : 
                    '日付を選択してください'
                  }
                </h3>
                {selectedDate && (
                  <div className="space-y-3">
                    {getPaymentsForDate(selectedDate).length > 0 ? (
                      getPaymentsForDate(selectedDate).map(sub => (
                        <div key={sub.id} className="p-4 border rounded-lg bg-orange-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{sub.name}</h4>
                              <p className="text-sm text-gray-600">{sub.cardName}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">¥{sub.price.toLocaleString()}</p>
                              <Badge variant="outline" className="text-xs">
                                {sub.category}
                              </Badge>
                            </div>
                          </div>
                          {sub.isTrialPeriod && (
                            <Badge className="mt-2 bg-blue-100 text-blue-800">
                              無料トライアル
                            </Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">この日に支払い予定はありません</p>
                    )}
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold mb-3">今月の支払い一覧</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {thisMonthPayments.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between p-2 rounded bg-gray-50">
                        <div>
                          <span className="font-medium">{sub.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(sub.nextPayment).getDate()}日
                          </span>
                        </div>
                        <span className="font-semibold">¥{sub.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
};

export default CalendarView;
