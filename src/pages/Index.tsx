import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Bell, Calendar, CreditCard, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SubscriptionCard from '@/components/SubscriptionCard';
import AddSubscriptionModal from '@/components/AddSubscriptionModal';
import MonthlySpendingChart from '@/components/MonthlySpendingChart';
import UpcomingPayments from '@/components/UpcomingPayments';
import CalendarView from '@/components/CalendarView';

// Mock data for demonstration
const mockSubscriptions = [
  {
    id: 1,
    name: 'Netflix',
    price: 1490,
    category: 'エンタメ',
    cardName: 'my fav card',
    nextPayment: '2025-06-10',
    isTrialPeriod: false,
  },
  {
    id: 2,
    name: 'ChatGPT Plus',
    price: 2000,
    category: 'AI',
    cardName: '予備カード',
    nextPayment: '2025-06-08',
    isTrialPeriod: false,
  },
  {
    id: 3,
    name: 'Adobe Creative Cloud',
    price: 6248,
    category: 'ビジネス',
    cardName: 'my fav card',
    nextPayment: '2025-06-12',
    isTrialPeriod: true,
    trialEndDate: '2025-06-07',
  },
];

const categories = ['すべて', 'AI', '音楽', '趣味', 'ビジネス', 'エンタメ', '英語', 'その他'];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);

  // トライアル期間終了チェック機能
  useEffect(() => {
    const checkAndUpdateTrialSubscriptions = () => {
      const today = new Date();
      const updatedSubscriptions = subscriptions.map(sub => {
        if (sub.isTrialPeriod && sub.trialEndDate) {
          const trialEndDate = new Date(sub.trialEndDate);
          // トライアルが終了している場合
          if (today > trialEndDate) {
            console.log(`トライアル終了を検知: ${sub.name}`);
            // トライアル終了日の1ヶ月後を次回支払い日に設定
            const nextPaymentDate = new Date(trialEndDate);
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            
            return {
              ...sub,
              isTrialPeriod: false,
              trialEndDate: undefined,
              nextPayment: nextPaymentDate.toISOString().split('T')[0]
            };
          }
        }
        return sub;
      });
      
      // 変更があった場合のみ状態を更新
      const hasChanges = updatedSubscriptions.some((sub, index) => 
        sub.isTrialPeriod !== subscriptions[index].isTrialPeriod ||
        sub.nextPayment !== subscriptions[index].nextPayment
      );
      
      if (hasChanges) {
        console.log('トライアル期間終了による自動更新を実行');
        setSubscriptions(updatedSubscriptions);
      }
    };

    // 初回チェック
    checkAndUpdateTrialSubscriptions();
    
    // 定期的にチェック（24時間ごと）
    const interval = setInterval(checkAndUpdateTrialSubscriptions, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [subscriptions]);

  const filteredSubscriptions = selectedCategory === 'すべて' 
    ? subscriptions 
    : subscriptions.filter(sub => sub.category === selectedCategory);

  // 有料サブスクと無料トライアルを分ける
  const paidSubscriptions = subscriptions.filter(sub => !sub.isTrialPeriod);
  const trialSubscriptions = subscriptions.filter(sub => sub.isTrialPeriod);

  const totalMonthlySpend = paidSubscriptions.reduce((total, sub) => total + sub.price, 0);
  const totalTrialValue = trialSubscriptions.reduce((total, sub) => total + sub.price, 0);

  // サブスクリプションを並び替え：支払い予定日の近い順にソート、無料トライアルは後
  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    // 無料トライアルは後ろに配置
    if (a.isTrialPeriod && !b.isTrialPeriod) return 1;
    if (!a.isTrialPeriod && b.isTrialPeriod) return -1;
    
    // 同じタイプ内では支払い予定日が近い順
    const dateA = new Date(a.nextPayment);
    const dateB = new Date(b.nextPayment);
    return dateA.getTime() - dateB.getTime();
  });

  const upcomingAlerts = subscriptions.filter(sub => {
    const today = new Date();
    const paymentDate = new Date(sub.nextPayment);
    const daysUntilPayment = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilPayment <= 3;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">SubMemo</h1>
            <p className="text-slate-300">あなたのサブスクリプションを一元管理</p>
          </div>
          <Link to="/monthly-spending">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold">
              <BarChart3 className="w-4 h-4 mr-2" />
              月別支出分析
            </Button>
          </Link>
        </div>

        {/* Alerts */}
        {upcomingAlerts.length > 0 && upcomingAlerts.slice(0, 3).length > 0 && (
          <Card className="mb-6 border-orange-500 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <Bell className="w-5 h-5 mr-2" />
                直近の支払い予報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingAlerts.slice(0, 3).map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border-2 border-orange-300 bg-orange-100">
                    <span className="text-orange-800 font-medium">{sub.name}</span>
                    <Badge variant="outline" className="text-orange-700 border-orange-400 bg-white">
                      {sub.nextPayment}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-48 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">月額合計</CardTitle>
              <CreditCard className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="text-2xl font-bold text-white">¥{totalMonthlySpend.toLocaleString()}</div>
              <p className="text-xs text-slate-300">
                年額 ¥{(totalMonthlySpend * 12).toLocaleString()}
              </p>
              {trialSubscriptions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <p className="text-xs text-blue-300">
                    無料トライアル: ¥{totalTrialValue.toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-48 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">登録サービス数</CardTitle>
              <Plus className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="text-2xl font-bold text-white">{paidSubscriptions.length}</div>
              <p className="text-xs text-slate-300">
                有料サブスク
              </p>
              {trialSubscriptions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <p className="text-xs text-blue-300">
                    無料トライアル: {trialSubscriptions.length}件
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <CalendarView subscriptions={subscriptions} />
        </div>

        {/* Category Filter and Add Button */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category 
                  ? "bg-purple-500 hover:bg-purple-600 text-white" 
                  : "text-black border-white/30 hover:bg-white/10 hover:text-white bg-white"
                }
              >
                {category}
              </Button>
            ))}
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold lg:ml-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規登録
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subscriptions List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-white mb-4">
              サブスクリプション一覧
              {selectedCategory !== 'すべて' && (
                <span className="text-lg text-slate-300 ml-2">({selectedCategory})</span>
              )}
            </h2>
            <div className="grid gap-4">
              {sortedSubscriptions.map(subscription => (
                <SubscriptionCard 
                  key={subscription.id} 
                  subscription={subscription}
                />
              ))}
              {sortedSubscriptions.length === 0 && (
                <Card className="bg-white/5 backdrop-blur-lg border-white/20">
                  <CardContent className="p-6 text-center">
                    <p className="text-slate-300">このカテゴリにサブスクはありません</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MonthlySpendingChart subscriptions={paidSubscriptions} />
            <UpcomingPayments subscriptions={subscriptions} />
          </div>
        </div>
      </div>

      <AddSubscriptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAdd={(newSub) => {
          setSubscriptions([...subscriptions, { ...newSub, id: Date.now() }]);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default Index;
