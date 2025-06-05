import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PaymentHistory {
  id: string;
  subscription_id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  category: string;
  created_at: string;
  subscription?: {
    name: string;
  };
}

export interface MonthlySpending {
  month: string;
  total: number;
  categories: {
    [category: string]: number;
  };
}

export const usePaymentHistory = () => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [monthlySpending, setMonthlySpending] = useState<MonthlySpending[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // 支払い履歴を取得
  const fetchPaymentHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_history')
        .select(`
          *,
          subscriptions (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPaymentHistory(data || []);
      
      // 月別集計データを生成
      generateMonthlySpending(data || []);
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      toast({
        title: "エラー",
        description: "支払い履歴の取得に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 新しい支払い履歴を追加
  const addPaymentHistory = async (payment: {
    subscription_id: string;
    amount: number;
    payment_date: string;
    category: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payment_history')
        .insert([{
          ...payment,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      // ローカル状態を更新
      setPaymentHistory(prev => [data, ...prev]);
      
      toast({
        title: "成功",
        description: "支払い履歴を追加しました。",
      });

      return data;
    } catch (error: any) {
      console.error('Error adding payment history:', error);
      toast({
        title: "エラー",
        description: "支払い履歴の追加に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // 月別集計データを生成
  const generateMonthlySpending = (payments: PaymentHistory[]) => {
    const monthlyData: { [month: string]: MonthlySpending } = {};

    payments.forEach(payment => {
      const date = new Date(payment.payment_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          total: 0,
          categories: {},
        };
      }

      monthlyData[monthKey].total += payment.amount;
      
      if (!monthlyData[monthKey].categories[payment.category]) {
        monthlyData[monthKey].categories[payment.category] = 0;
      }
      monthlyData[monthKey].categories[payment.category] += payment.amount;
    });

    // 月別データをソート（新しい月から順番）
    const sortedMonthlyData = Object.values(monthlyData).sort((a, b) => 
      new Date(b.month).getTime() - new Date(a.month).getTime()
    );

    setMonthlySpending(sortedMonthlyData);
  };

  // サブスクリプション作成時の初回支払い履歴を自動生成
  const createInitialPaymentHistory = async (subscription: {
    id: string;
    name: string;
    price: number;
    category: string;
    next_payment: string;
    is_trial_period: boolean;
  }) => {
    // トライアル期間中は支払い履歴を作成しない
    if (subscription.is_trial_period) return;

    try {
      await addPaymentHistory({
        subscription_id: subscription.id,
        amount: subscription.price,
        payment_date: new Date().toISOString().split('T')[0], // 今日の日付
        category: subscription.category,
      });
    } catch (error) {
      console.error('Error creating initial payment history:', error);
    }
  };

  // 定期支払い履歴の自動生成（支払い日が到来したサブスクリプション用）
  const processScheduledPayments = async (subscriptions: any[]) => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const subscription of subscriptions) {
      // トライアル期間中はスキップ
      if (subscription.is_trial_period) continue;

      const nextPaymentDate = new Date(subscription.next_payment);
      nextPaymentDate.setHours(0, 0, 0, 0);

      // 支払い日が今日または過去の場合
      if (nextPaymentDate <= today) {
        try {
          // 既に今日の支払い履歴があるかチェック
          const { data: existingPayment } = await supabase
            .from('payment_history')
            .select('id')
            .eq('subscription_id', subscription.id)
            .eq('payment_date', today.toISOString().split('T')[0])
            .single();

          // 既に履歴があればスキップ
          if (existingPayment) continue;

          // 支払い履歴を作成
          await addPaymentHistory({
            subscription_id: subscription.id,
            amount: subscription.price,
            payment_date: today.toISOString().split('T')[0],
            category: subscription.category,
          });

          console.log(`定期支払い処理完了: ${subscription.name}`);
        } catch (error) {
          console.error('Error processing scheduled payment:', error);
        }
      }
    }
  };

  // 初期データ取得とリアルタイム更新
  useEffect(() => {
    if (user) {
      fetchPaymentHistory();

      // Supabaseのリアルタイム機能で支払い履歴の変更を監視
      const subscription = supabase
        .channel('payment_history_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payment_history',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Payment history change received:', payload);
            fetchPaymentHistory();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  return {
    paymentHistory,
    monthlySpending,
    loading,
    fetchPaymentHistory,
    addPaymentHistory,
    createInitialPaymentHistory,
    processScheduledPayments,
    generateMonthlySpending,
  };
};