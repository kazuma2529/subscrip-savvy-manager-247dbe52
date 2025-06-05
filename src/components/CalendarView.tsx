
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

  // 無料トライアル終了日も取得
  const thisMonthTrialEnds = subscriptions.filter(sub => {
    if (!sub.isTrialPeriod || !sub.trialEndDate) return false;
    const trialEndDate = new Date(sub.trialEndDate);
    return trialEndDate >= startOfMonth && trialEndDate <= endOfMonth;
  });

  // 支払い予定日順にソート
  const sortedPayments = [...thisMonthPayments].sort((a, b) => {
    const dateA = new Date(a.nextPayment);
    const dateB = new Date(b.nextPayment);
    return dateA.getTime() - dateB.getTime();
  });

  // 日付ごとの支払いをグループ化
  const getPaymentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return thisMonthPayments.filter(sub => {
      const paymentDateStr = new Date(sub.nextPayment).toISOString().split('T')[0];
      return paymentDateStr === dateStr;
    });
  };

  // 日付ごとの無料トライアル終了をグループ化
  const getTrialEndsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return thisMonthTrialEnds.filter(sub => {
      const trialEndDateStr = new Date(sub.trialEndDate!).toISOString().split('T')[0];
      return trialEndDateStr === dateStr;
    });
  };

  // カレンダーに支払い日と無料トライアル終了日をマーク
  const paymentDates = thisMonthPayments.map(sub => new Date(sub.nextPayment));
  const trialEndDates = thisMonthTrialEnds.map(sub => new Date(sub.trialEndDate!));

  const modifiers = {
    payment: paymentDates,
    trialEnd: trialEndDates,
  };

  const modifiersStyles = {
    payment: {
      backgroundColor: '#f97316',
      color: 'white',
      borderRadius: '50%',
      fontWeight: 'bold',
    },
    trialEnd: {
      backgroundColor: '#60a5fa',
      color: 'white',
      borderRadius: '50%',
      fontWeight: 'bold',
    },
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/15 transition-colors p-4">
            <div className="bg-white/20 rounded-lg p-4">
              <div className="grid grid-cols-7 gap-1 text-xs text-white/70 mb-2">
                <div>日</div>
                <div>月</div>
                <div>火</div>
                <div>水</div>
                <div>木</div>
                <div>金</div>
                <div>土</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date(startOfMonth);
                  date.setDate(date.getDate() - startOfMonth.getDay() + i);
                  const isCurrentMonth = date.getMonth() === now.getMonth();
                  const hasPayment = getPaymentsForDate(date).length > 0;
                  const hasTrialEnd = getTrialEndsForDate(date).length > 0;
                  
                  return (
                    <div
                      key={i}
                      className={`text-xs h-6 w-6 flex items-center justify-center rounded ${
                        isCurrentMonth 
                          ? hasPayment 
                            ? 'bg-orange-500 text-white font-bold'
                            : hasTrialEnd
                            ? 'bg-blue-400 text-white font-bold'
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
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-6xl w-full h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">今月の支払いカレンダー</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-8 h-full mt-4">
            {/* 左側：カレンダー */}
            <div className="flex flex-col">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="rounded-md border pointer-events-auto w-full"
              />
              {selectedDate && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">
                    {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日の予定
                  </h4>
                  {(getPaymentsForDate(selectedDate).length > 0 || getTrialEndsForDate(selectedDate).length > 0) ? (
                    <div className="space-y-2">
                      {getPaymentsForDate(selectedDate).map(sub => (
                        <div key={sub.id} className="p-3 border rounded-lg bg-orange-50">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{sub.name}</span>
                            <span className="font-bold">¥{sub.price.toLocaleString()}</span>
                          </div>
                          <div className="text-sm text-gray-600">支払い予定</div>
                        </div>
                      ))}
                      {getTrialEndsForDate(selectedDate).map(sub => (
                        <div key={sub.id} className="p-3 border rounded-lg bg-blue-50">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{sub.name}</span>
                            <span className="font-bold">¥{sub.price.toLocaleString()}</span>
                          </div>
                          <div className="text-sm text-blue-600">無料トライアル終了</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">この日に予定はありません</p>
                  )}
                </div>
              )}
            </div>
            
            {/* 右側：支払い一覧 */}
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-semibold mb-4">今月の支払い予定</h3>
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-fit">
                  {sortedPayments.map(sub => {
                    const paymentDate = new Date(sub.nextPayment);
                    const day = paymentDate.getDate();
                    
                    return (
                      <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors h-fit">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-bold text-orange-600 w-6">
                            {day}日
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm truncate">{sub.name}</div>
                            <div className="text-xs text-gray-500 truncate">{sub.cardName}</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-sm">¥{sub.price.toLocaleString()}</div>
                          <Badge variant="outline" className="text-xs">
                            {sub.category}
                          </Badge>
                          {sub.isTrialPeriod && (
                            <Badge className="ml-1 bg-blue-100 text-blue-800 text-xs">
                              トライアル
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {sortedPayments.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      今月の支払い予定はありません
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalendarView;
