
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Bell, Calendar, CreditCard } from 'lucide-react';
import SubscriptionCard from '@/components/SubscriptionCard';
import AddSubscriptionModal from '@/components/AddSubscriptionModal';
import MonthlySpendingChart from '@/components/MonthlySpendingChart';
import UpcomingPayments from '@/components/UpcomingPayments';

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

  const filteredSubscriptions = selectedCategory === 'すべて' 
    ? subscriptions 
    : subscriptions.filter(sub => sub.category === selectedCategory);

  // 有料サブスクと無料トライアルを分ける
  const paidSubscriptions = subscriptions.filter(sub => !sub.isTrialPeriod);
  const trialSubscriptions = subscriptions.filter(sub => sub.isTrialPeriod);

  const totalMonthlySpend = paidSubscriptions.reduce((total, sub) => total + sub.price, 0);
  const totalTrialValue = trialSubscriptions.reduce((total, sub) => total + sub.price, 0);

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
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規登録
          </Button>
        </div>

        {/* Alerts */}
        {upcomingAlerts.length > 0 && (
          <Card className="mb-6 border-orange-500 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <Bell className="w-5 h-5 mr-2" />
                直近の支払い予報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingAlerts.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between">
                    <span className="text-orange-700">{sub.name}</span>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
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
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">月額合計</CardTitle>
              <CreditCard className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
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

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">登録サービス数</CardTitle>
              <Plus className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
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

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">今月の支払い</CardTitle>
              <Calendar className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{upcomingAlerts.length}</div>
              <p className="text-xs text-slate-300">
                3日以内に支払い予定
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category 
                ? "bg-purple-500 hover:bg-purple-600 text-white" 
                : "text-white border-white/30 hover:bg-white/10"
              }
            >
              {category}
            </Button>
          ))}
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
              {filteredSubscriptions.map(subscription => (
                <SubscriptionCard 
                  key={subscription.id} 
                  subscription={subscription}
                />
              ))}
              {filteredSubscriptions.length === 0 && (
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
            <MonthlySpendingChart subscriptions={subscriptions} />
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
