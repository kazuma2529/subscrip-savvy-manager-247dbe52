# メール通知機能のセットアップガイド

SubMemo アプリのメール通知機能を有効にするための手順です。

## 🚀 実装済み機能

✅ **通知タイミング**

- トライアル期間終了の 2 日前・前日 21:00 に通知
- 通常サブスク更新の 3 日前・前日 21:00 に通知

✅ **技術スタック**

- Supabase Edge Functions（無料枠: 月 50,000 回まで）
- Resend API（無料枠: 月 3,000 通まで）
- 自動日次スケジューリング

✅ **機能**

- 通知設定画面
- 通知履歴管理
- 重複送信防止
- 日本時間対応

## 📋 セットアップ手順

### 1. Supabase プロジェクトの準備

```bash
# Supabase CLIをインストール（未インストールの場合）
npm install -g @supabase/cli

# プロジェクトディレクトリで初期化
cd your-project
supabase login
supabase init
```

### 2. データベーステーブルの作成

```bash
# マイグレーションを実行
supabase db push

# または、Supabase Dashboard > SQL Editorで以下を実行：
```

```sql
-- supabase/migrations/20241220_add_notification_settings.sql の内容を実行
```

### 3. Resend アカウントのセットアップ

1. [Resend](https://resend.com/)でアカウント作成
2. API キーを取得（無料プラン: 3,000 通/月）
3. 送信元ドメインの設定（任意、テスト用なら不要）

### 4. Edge Functions のデプロイ

```bash
# Edge Functions をデプロイ
supabase functions deploy email-notifications
supabase functions deploy daily-notification-scheduler

# 環境変数を設定
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
supabase secrets set FROM_EMAIL="SubMemo <notifications@yourdomain.com>"
```

### 5. 定期実行の設定

**方法 A: Supabase Cron（推奨、プランによっては有料）**

```sql
SELECT cron.schedule(
  'daily-notifications',
  '0 12 * * *', -- UTC 12:00 = JST 21:00
  'SELECT net.http_post(
    url := ''https://your-project-ref.supabase.co/functions/v1/daily-notification-scheduler'',
    headers := jsonb_build_object(''Authorization'', ''Bearer '' || current_setting(''app.settings.service_role_key''))
  )'
);
```

**方法 B: 外部 Cron サービス（無料）**

- [cron-job.org](https://cron-job.org/)
- [EasyCron](https://www.easycron.com/)
- GitHub Actions

例：GitHub Actions（.github/workflows/daily-notifications.yml）

```yaml
name: Daily Notifications
on:
  schedule:
    - cron: "0 12 * * *" # UTC 12:00 = JST 21:00
jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger notifications
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            https://your-project-ref.supabase.co/functions/v1/daily-notification-scheduler
```

### 6. 環境変数の設定

`.env.local`（ローカル開発用）:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 テスト方法

### 1. 手動テスト

```bash
# Edge Function を直接呼び出し
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  https://your-project-ref.supabase.co/functions/v1/email-notifications
```

### 2. アプリでテスト

1. サブスクリプションを追加（トライアル期間終了日を明日に設定）
2. 通知設定画面で設定を確認
3. 次の日の 21:00 に通知が送信されるか確認

## 🔧 トラブルシューティング

### 通知が送信されない場合

1. **Edge Functions のログを確認**

```bash
supabase functions logs email-notifications
```

2. **データベースの確認**

```sql
-- 通知設定を確認
SELECT * FROM notification_settings;

-- トライアル期間のサブスクリプションを確認
SELECT * FROM subscriptions WHERE is_trial_period = true;

-- 通知履歴を確認
SELECT * FROM notification_history ORDER BY sent_at DESC;
```

3. **Resend API キーの確認**

```bash
# Secrets を確認
supabase secrets list
```

### よくある問題

**Q: 通知が重複して送信される**
A: `notification_history`テーブルで重複チェックしているはずです。ログを確認してください。

**Q: 日本時間の計算が正しくない**
A: Edge Function では `new Date(now.getTime() + (9 * 60 * 60 * 1000))` で JST に変換しています。

**Q: Resend API でエラーが発生する**
A: フォールバック機能により、コンソールログに記録されます。本番環境では Resend の API キーとドメイン設定を確認してください。

## 💰 コスト

- **Supabase Edge Functions**: 無料枠 50,000 回/月
- **Resend**: 無料枠 3,000 通/月
- **外部 Cron サービス**: 無料枠あり

**月間コスト想定**:

- ユーザー 100 人、1 人 10 サブスクリプションの場合
- 1 日最大 20 通 × 30 日 = 600 通/月
- → 完全無料で運用可能

## 🚀 今後の拡張案

1. **通知タイミングのカスタマイズ**

   - ユーザーが通知日数を設定可能に

2. **通知チャンネルの追加**

   - LINE 通知
   - Slack 通知
   - プッシュ通知

3. **通知内容の充実**

   - 月間支出サマリー
   - 解約推奨アラート
   - 価格変更通知

4. **スマート通知**
   - 使用頻度に基づく通知調整
   - 重要度別の通知優先度

## 📞 サポート

問題が解決しない場合は、以下の情報と一緒にお知らせください：

1. エラーメッセージ
2. Edge Functions のログ
3. データベースの状態
4. 期待される動作と実際の動作

---

これで、完全無料でメール通知機能が利用できます！ 🎉
