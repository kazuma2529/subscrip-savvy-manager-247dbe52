import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Bell, Calendar, CreditCard, BarChart3, Loader2, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import SubscriptionCard from '@/components/SubscriptionCard';
import AddSubscriptionModal from '@/components/AddSubscriptionModal';
import EditSubscriptionModal from '@/components/EditSubscriptionModal';
import MonthlySpendingChart from '@/components/MonthlySpendingChart';
import UpcomingPayments from '@/components/UpcomingPayments';
import CalendarView from '@/components/CalendarView';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useAuth } from '@/contexts/AuthContext';

const categories = ['すべて', 'AI', '音楽', '趣味', 'ビジネス', 'エンタメ', '英語', 'その他'];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription } = useSubscriptions();
  const { signOut, user } = useAuth();

  // データ型を変換する関数（Supabaseのデータ → 既存コンポーネントの形式）
  const convertSubscriptionFormat = (sub: any) => ({
    id: sub.id,
    name: sub.name,
    price: sub.price,
    category: sub.category,
    cardName: sub.card_name || '',
    nextPayment: sub.next_payment,
    isTrialPeriod: sub.is_trial_period,
    trialEndDate: sub.trial_end_date,
  });

  // 表示用に変換したサブスクリプション
  const displaySubscriptions = subscriptions.map(convertSubscriptionFormat);

  const filteredSubscriptions = selectedCategory === 'すべて' 
    ? displaySubscriptions 
    : displaySubscriptions.filter(sub => sub.category === selectedCategory);

  // 有料サブスクと無料トライアルを分ける
  const paidSubscriptions = displaySubscriptions.filter(sub => !sub.isTrialPeriod);
  const trialSubscriptions = displaySubscriptions.filter(sub => sub.isTrialPeriod);

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

  const upcomingAlerts = displaySubscriptions.filter(sub => {
    const today = new Date();
    const paymentDate = new Date(sub.nextPayment);
    const daysUntilPayment = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilPayment <= 3;
  });

  const handleAddSubscription = async (newSub: any) => {
    try {
      await addSubscription({
        name: newSub.name,
        price: newSub.price,
        category: newSub.category,
        cardName: newSub.cardName,
        isTrialPeriod: newSub.isTrialPeriod,
        trialEndDate: newSub.trialEndDate,
        nextPayment: newSub.nextPayment,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding subscription:', error);
    }
  };

  // 編集機能
  const handleEditSubscription = (subscription: any) => {
    setEditingSubscription(subscription);
    setIsEditModalOpen(true);
  };

  // 削除機能
  const handleDeleteSubscription = async (id: string | number) => {
    try {
      await deleteSubscription(id.toString());
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  // 編集保存機能
  const handleSaveSubscription = async (id: string | number, updates: any) => {
    try {
      await updateSubscription(id.toString(), updates);
      setIsEditModalOpen(false);
      setEditingSubscription(null);
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">SubMemo</h1>
            <p className="text-sm md:text-base text-slate-300">あなたのサブスクリプションを一元管理</p>
            <p className="text-xs text-slate-400 mt-1">ログイン中: {user?.email}</p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:gap-3">
            <Link to="/monthly-spending" className="w-full md:w-auto">
              <Button className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold h-12 md:h-auto">
                <BarChart3 className="w-4 h-4 mr-2" />
                月別支出分析
              </Button>
            </Link>
            <Link to="/notification-settings" className="w-full md:w-auto">
              <Button variant="outline" className="w-full md:w-auto text-black bg-white border-white/30 hover:bg-white/90 hover:text-black h-12 md:h-auto">
                <Bell className="w-4 h-4 mr-2" />
                通知設定
              </Button>
            </Link>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full md:w-auto text-black bg-white border-white/30 hover:bg-white/90 hover:text-black h-12 md:h-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 min-h-[140px] md:h-48 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-white">月額合計</CardTitle>
              <CreditCard className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center pt-0">
              <div className="text-xl md:text-2xl font-bold text-white mb-1">¥{totalMonthlySpend.toLocaleString()}</div>
              <p className="text-xs text-slate-300 mb-2">
                年額 ¥{(totalMonthlySpend * 12).toLocaleString()}
              </p>
              {trialSubscriptions.length > 0 && (
                <div className="mt-auto pt-2 border-t border-white/20">
                  <p className="text-xs text-blue-300">
                    無料トライアル: ¥{totalTrialValue.toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 min-h-[140px] md:h-48 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-white">登録サービス数</CardTitle>
              <Plus className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center pt-0">
              <div className="text-xl md:text-2xl font-bold text-white mb-1">{paidSubscriptions.length}</div>
              <p className="text-xs text-slate-300 mb-2">
                有料サブスク
              </p>
              {trialSubscriptions.length > 0 && (
                <div className="mt-auto pt-2 border-t border-white/20">
                  <p className="text-xs text-blue-300">
                    無料トライアル: {trialSubscriptions.length}件
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2 xl:col-span-1">
            <CalendarView subscriptions={displaySubscriptions} />
          </div>
        </div>

        {/* Category Filter and Add Button */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`h-10 px-3 text-sm ${selectedCategory === category 
                  ? "bg-purple-500 hover:bg-purple-600 text-white" 
                  : "text-black border-white/30 hover:bg-white/10 hover:text-white bg-white"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="w-full lg:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold h-12 lg:h-auto lg:ml-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規登録
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Subscriptions List */}
          <div className="xl:col-span-2">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
              サブスクリプション一覧
              {selectedCategory !== 'すべて' && (
                <span className="text-base md:text-lg text-slate-300 ml-2">({selectedCategory})</span>
              )}
            </h2>
            <div className="grid gap-4">
              {sortedSubscriptions.map(subscription => (
                <SubscriptionCard 
                  key={subscription.id} 
                  subscription={subscription}
                  onEdit={handleEditSubscription}
                  onDelete={handleDeleteSubscription}
                />
              ))}
              {sortedSubscriptions.length === 0 && (
                <Card className="bg-white/5 backdrop-blur-lg border-white/20">
                  <CardContent className="p-6 text-center">
                    <p className="text-slate-300">
                      {selectedCategory === 'すべて' 
                        ? 'まだサブスクリプションが登録されていません' 
                        : 'このカテゴリにサブスクはありません'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 xl:block">
            <MonthlySpendingChart subscriptions={paidSubscriptions} />
            <UpcomingPayments subscriptions={displaySubscriptions} />
          </div>
        </div>
      </div>

      <AddSubscriptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSubscription}
      />

      <EditSubscriptionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSubscription(null);
        }}
        onSave={handleSaveSubscription}
        subscription={editingSubscription}
      />
    </div>
  );
};

export default Index;