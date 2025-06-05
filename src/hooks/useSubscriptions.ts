import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  category: string;
  card_name: string | null;
  is_trial_period: boolean;
  trial_end_date: string | null;
  next_payment: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface NewSubscription {
  name: string;
  price: number;
  category: string;
  cardName: string;
  isTrialPeriod: boolean;
  trialEndDate?: string;
  nextPayment: string;
}

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // 支払い履歴を自動生成する関数
  const createPaymentHistory = async (subscription: Subscription) => {
    if (!user || subscription.is_trial_period) return;

    try {
      await supabase
        .from('payment_history')
        .insert([{
          subscription_id: subscription.id,
          user_id: user.id,
          amount: subscription.price,
          payment_date: new Date().toISOString().split('T')[0],
          category: subscription.category,
        }]);
      
      console.log(`支払い履歴を作成: ${subscription.name}`);
    } catch (error) {
      console.error('Error creating payment history:', error);
    }
  };

  // サブスクリプション一覧を取得
  const fetchSubscriptions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "エラー",
        description: "サブスクリプションの取得に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 新しいサブスクリプションを追加
  const addSubscription = async (newSub: NewSubscription) => {
    if (!user) return;

    try {
      const subscriptionData = {
        user_id: user.id,
        name: newSub.name,
        price: newSub.price,
        category: newSub.category,
        card_name: newSub.cardName || null,
        is_trial_period: newSub.isTrialPeriod,
        trial_end_date: newSub.trialEndDate && newSub.trialEndDate.trim() !== '' ? newSub.trialEndDate : null,
        next_payment: newSub.nextPayment && newSub.nextPayment.trim() !== '' ? newSub.nextPayment : null,
      };

      const { data, error } = await supabase
        .from('subscriptions')
        .insert([subscriptionData])
        .select()
        .single();

      if (error) throw error;

      // 一覧を更新
      setSubscriptions(prev => [data, ...prev]);
      
      // 非トライアルの場合、初回支払い履歴を作成
      if (!newSub.isTrialPeriod) {
        await createPaymentHistory(data);
      }
      
      toast({
        title: "成功",
        description: "サブスクリプションを追加しました。",
      });

      return data;
    } catch (error: any) {
      console.error('Error adding subscription:', error);
      toast({
        title: "エラー",
        description: "サブスクリプションの追加に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // サブスクリプションを更新
  const updateSubscription = async (id: string, updates: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // 一覧を更新
      setSubscriptions(prev => 
        prev.map(sub => sub.id === id ? data : sub)
      );

      toast({
        title: "成功",
        description: "サブスクリプションを更新しました。",
      });

      return data;
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      toast({
        title: "エラー",
        description: "サブスクリプションの更新に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // サブスクリプションを削除
  const deleteSubscription = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // 一覧から削除
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));

      toast({
        title: "成功",
        description: "サブスクリプションを削除しました。",
      });
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      toast({
        title: "エラー",
        description: "サブスクリプションの削除に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // 定期支払い処理（支払い日が到来したサブスクリプション）
  const processScheduledPayments = async () => {
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
            .maybeSingle();

          // 既に履歴があればスキップ
          if (existingPayment) continue;

          // 支払い履歴を作成
          await supabase
            .from('payment_history')
            .insert([{
              subscription_id: subscription.id,
              user_id: user.id,
              amount: subscription.price,
              payment_date: today.toISOString().split('T')[0],
              category: subscription.category,
            }]);

          // 次回支払い日を1ヶ月後に更新
          const nextMonth = new Date(nextPaymentDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          await updateSubscription(subscription.id, {
            next_payment: nextMonth.toISOString().split('T')[0],
          });

          console.log(`定期支払い処理完了: ${subscription.name}`);
        } catch (error) {
          console.error(`定期支払い処理エラー: ${subscription.name}`, error);
        }
      }
    }
  };

  // トライアル期間終了チェック・自動更新
  const checkAndUpdateTrials = async () => {
    if (!user) return;

    try {
      const today = new Date();
      const trialSubs = subscriptions.filter(sub => 
        sub.is_trial_period && 
        sub.trial_end_date && 
        new Date(sub.trial_end_date) < today
      );

      for (const sub of trialSubs) {
        if (sub.trial_end_date) {
          // トライアル終了日から1ヶ月後を次回支払い日に設定
          const trialEndDate = new Date(sub.trial_end_date);
          const nextPaymentDate = new Date(trialEndDate);
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

          const updatedSub = await updateSubscription(sub.id, {
            is_trial_period: false,
            trial_end_date: null,
            next_payment: nextPaymentDate.toISOString().split('T')[0],
          });

          // トライアル終了時の初回支払い履歴を作成
          if (updatedSub) {
            await createPaymentHistory(updatedSub);
          }

          console.log(`トライアル終了を検知・更新: ${sub.name}`);
        }
      }
    } catch (error: any) {
      console.error('Error checking trials:', error);
    }
  };

  // 初期データ取得とリアルタイム更新の設定
  useEffect(() => {
    if (user) {
      fetchSubscriptions();

      // Supabaseのリアルタイム機能でデータ変更を監視
      const subscription = supabase
        .channel('subscriptions_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Real-time change received:', payload);
            // 変更があった場合はデータを再取得
            fetchSubscriptions();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  // 定期処理（トライアル期間チェック・定期支払い処理）
  useEffect(() => {
    if (subscriptions.length > 0) {
      checkAndUpdateTrials();
      processScheduledPayments();

      // 24時間ごとにチェック
      const interval = setInterval(() => {
        checkAndUpdateTrials();
        processScheduledPayments();
      }, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [subscriptions]);

  return {
    subscriptions,
    loading,
    fetchSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    checkAndUpdateTrials,
    processScheduledPayments,
  };
};