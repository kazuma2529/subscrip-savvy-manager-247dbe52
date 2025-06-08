import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Bell, Mail, Clock, History } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotificationSettings {
  id?: string;
  email_notifications_enabled: boolean;
  trial_notification_days: number[];
  payment_notification_days: number[];
  notification_time: string;
  timezone: string;
}

interface NotificationHistory {
  id: string;
  notification_type: string;
  days_before: number;
  sent_at: string;
  email_address: string;
  subject: string;
  status: string;
  subscription?: {
    name: string;
  };
}

const NotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications_enabled: true,
    trial_notification_days: [2, 1],
    payment_notification_days: [3, 1],
    notification_time: '21:00:00',
    timezone: 'Asia/Tokyo'
  });
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchHistory();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: "エラー",
        description: "設定の取得に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_history')
        .select(`
          *,
          subscriptions(name)
        `)
        .eq('user_id', user?.id)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching history:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...settings
        });

      if (error) throw error;

      toast({
        title: "保存完了",
        description: "通知設定を保存しました。",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "エラー",
        description: "設定の保存に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async () => {
    try {
      const response = await fetch('/api/functions/v1/email-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          test: true,
          user_id: user?.id
        })
      });

      if (response.ok) {
        toast({
          title: "テスト送信完了",
          description: "テストメールを送信しました。",
        });
      } else {
        throw new Error('Test notification failed');
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "テスト送信に失敗しました。",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="text-black bg-white border-white/30 hover:bg-white/90 hover:text-black">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">通知設定</h1>
            <p className="text-slate-300">メール通知の設定を管理できます</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                通知設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* メール通知の有効/無効 */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">メール通知</Label>
                  <p className="text-xs text-slate-400 mt-1">
                    サブスクリプションの支払い通知をメールで受け取る
                  </p>
                </div>
                <Switch
                  checked={settings.email_notifications_enabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, email_notifications_enabled: checked }))
                  }
                />
              </div>

              {settings.email_notifications_enabled && (
                <>
                  {/* トライアル通知タイミング */}
                  <div className="space-y-2">
                    <Label className="text-white">トライアル終了通知</Label>
                    <div className="flex gap-2">
                      {settings.trial_notification_days.map((days, index) => (
                        <Badge key={index} variant="outline" className="text-slate-300 border-slate-600">
                          {days}日前
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      無料トライアル終了の2日前と前日21:00に通知
                    </p>
                  </div>

                  {/* 支払い通知タイミング */}
                  <div className="space-y-2">
                    <Label className="text-white">支払い通知</Label>
                    <div className="flex gap-2">
                      {settings.payment_notification_days.map((days, index) => (
                        <Badge key={index} variant="outline" className="text-slate-300 border-slate-600">
                          {days}日前
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      サブスクリプション更新の3日前と前日21:00に通知
                    </p>
                  </div>

                  {/* 通知時刻 */}
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      通知時刻
                    </Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-slate-300 border-slate-600">
                        毎日 21:00 (JST)
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      毎日午後9時に通知チェックを自動実行します
                    </p>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={saveSettings}
                  disabled={saving}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {saving ? '保存中...' : '設定を保存'}
                </Button>
              </div>

              {/* 機能説明 */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
                <h3 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  通知機能について
                </h3>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• トライアル期間終了の2日前・前日に通知</li>
                  <li>• 通常サブスク更新の3日前・前日に通知</li>
                  <li>• 毎日21:00（日本時間）に自動チェック</li>
                  <li>• 登録されたメールアドレスに送信</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings; 