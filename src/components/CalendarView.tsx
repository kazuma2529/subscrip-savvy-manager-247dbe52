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
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/15 transition-colors min-h-[140px] md:h-48 flex flex-col">
            <div className="p-3 md:p-4 flex-1 flex flex-col">
              <h3 className="text-sm md:text-base font-medium text-white mb-2 md:mb-3">支払いカレンダー</h3>
              <div className="bg-white/20 rounded-lg p-2 md:p-4 flex-1 flex flex-col">
                <div className="grid grid-cols-7 gap-0.5 md:gap-1 text-xs text-white/70 mb-1 md:mb-2">
                  <div className="text-center">日</div>
                  <div className="text-center">月</div>
                  <div className="text-center">火</div>
                  <div className="text-center">水</div>
                  <div className="text-center">木</div>
                  <div className="text-center">金</div>
                  <div className="text-center">土</div>
                </div>
                <div className="grid grid-cols-7 gap-0.5 md:gap-1 flex-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date(startOfMonth);
                    date.setDate(date.getDate() - startOfMonth.getDay() + i);
                    const isCurrentMonth = date.getMonth() === now.getMonth();
                    const hasPayment = getPaymentsForDate(date).length > 0;
                    const hasTrialEnd = getTrialEndsForDate(date).length > 0;
                    
                    return (
                      <div
                        key={i}
                        className={`text-xs h-4 md:h-6 w-full flex items-center justify-center rounded text-center ${
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
                <div className="mt-2 text-center">
                  <p className="text-xs text-white/60">タップして詳細表示</p>
                </div>
              </div>
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] md:max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="pb-2 md:pb-4 flex-shrink-0">
            <DialogTitle className="text-lg md:text-xl font-bold">今月の支払いカレンダー</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 md:gap-8 flex-1 min-h-0 md:grid md:grid-cols-2">
            {/* カレンダー部分 */}
            <div className="flex flex-col h-auto md:min-h-0">
              <div className="mb-2 md:mb-4 flex-shrink-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  className="rounded-md border pointer-events-auto w-full mx-auto"
                />
              </div>
              {selectedDate && (
                <div className="flex-shrink-0 md:flex-1 md:min-h-0 md:flex md:flex-col md:overflow-hidden">
                  <h4 className="font-semibold mb-2 text-sm md:text-base flex-shrink-0">
                    {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日の予定
                  </h4>
                  <div className="max-h-32 md:flex-1 overflow-y-auto">
                    {(getPaymentsForDate(selectedDate).length > 0 || getTrialEndsForDate(selectedDate).length > 0) ? (
                      <div className="space-y-2 pb-2">
                        {getPaymentsForDate(selectedDate).map(sub => (
                          <div key={sub.id} className="p-2 md:p-3 border rounded-lg bg-orange-50">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm md:text-base truncate">{sub.name}</span>
                              <span className="font-bold text-sm md:text-base ml-2">¥{sub.price.toLocaleString()}</span>
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">支払い予定</div>
                          </div>
                        ))}
                        {getTrialEndsForDate(selectedDate).map(sub => (
                          <div key={sub.id} className="p-2 md:p-3 border rounded-lg bg-blue-50">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm md:text-base truncate">{sub.name}</span>
                              <span className="font-bold text-sm md:text-base ml-2">¥{sub.price.toLocaleString()}</span>
                            </div>
                            <div className="text-xs md:text-sm text-blue-600">無料トライアル終了</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">この日に予定はありません</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* 支払い一覧部分 */}
            <div className="flex flex-col min-h-0 flex-1 mt-6 md:mt-0">
              <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-4 flex-shrink-0">今月の支払い予定</h3>
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-2 md:grid md:grid-cols-1 lg:grid-cols-2 md:gap-2 md:space-y-0 pb-2">
                  {sortedPayments.map(sub => {
                    const paymentDate = new Date(sub.nextPayment);
                    const day = paymentDate.getDate();
                    
                    return (
                      <div key={sub.id} className="flex items-center justify-between p-2 md:p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                          <div className="text-sm font-bold text-orange-600 w-8 text-center flex-shrink-0">
                            {day}日
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm truncate">{sub.name}</div>
                            <div className="text-xs text-gray-500 truncate">{sub.cardName}</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="font-bold text-sm">¥{sub.price.toLocaleString()}</div>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {sub.category}
                            </Badge>
                            {sub.isTrialPeriod && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                トライアル
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {sortedPayments.length === 0 && (
                    <div className="text-center py-4 md:py-8 text-gray-500 md:col-span-full">
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
