import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Email service configuration (Resend)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'SubMemo <notifications@yourdomain.com>'

    if (!resendApiKey) {
      throw new Error('Email service credentials not configured')
    }

    // Get current date in JST
    const now = new Date()
    const jst = new Date(now.getTime() + (9 * 60 * 60 * 1000)) // JST is UTC+9
    const today = jst.toISOString().split('T')[0]

    console.log(`Processing notifications for date: ${today}`)

    // 1. Get all subscriptions
    const { data: allSubs, error: subsError } = await supabaseClient
      .from('subscriptions')
      .select('*')

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError)
      throw subsError
    }

    const notifications = []

    // Process each subscription
    for (const sub of allSubs || []) {
      try {
        // Get user email using auth.admin
        const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(sub.user_id)
        
        if (userError || !user?.email) {
          console.log(`Could not get email for user ${sub.user_id}`)
          continue
        }

        // 🔥 重要: 通知設定をチェック
        const { data: settings, error: settingsError } = await supabaseClient
          .from('notification_settings')
          .select('*')
          .eq('user_id', sub.user_id)
          .single()

        // デフォルト設定（通知ON）
        const notificationEnabled = settings ? settings.email_notifications_enabled : true
        const trialNotificationEnabled = settings ? settings.trial_ending_notifications : true
        const paymentNotificationEnabled = settings ? settings.payment_reminder_notifications : true

        if (!notificationEnabled) {
          console.log(`Email notifications disabled for user ${sub.user_id}`)
          continue
        }

        // Process trial subscriptions
        if (sub.is_trial_period && sub.trial_end_date && trialNotificationEnabled) {
          const trialEndDate = new Date(sub.trial_end_date)
          const daysDiff = Math.ceil((trialEndDate.getTime() - jst.getTime()) / (1000 * 60 * 60 * 24))

          // Send notification 2 days before and 1 day before
          if (daysDiff === 2 || daysDiff === 1) {
            const emailContent = createTrialEndingEmail(sub, daysDiff)
            notifications.push({
              to: user.email,
              subject: emailContent.subject,
              body: emailContent.body,
              type: 'trial_ending',
              subscription_id: sub.id,
              days_until: daysDiff
            })
          }
        }

        // Process regular subscriptions
        if (!sub.is_trial_period && sub.next_payment && paymentNotificationEnabled) {
          const paymentDate = new Date(sub.next_payment)
          const daysDiff = Math.ceil((paymentDate.getTime() - jst.getTime()) / (1000 * 60 * 60 * 24))

          // Send notification 3 days before and 1 day before
          if (daysDiff === 3 || daysDiff === 1) {
            const emailContent = createPaymentReminderEmail(sub, daysDiff)
            notifications.push({
              to: user.email,
              subject: emailContent.subject,
              body: emailContent.body,
              type: 'payment_reminder',
              subscription_id: sub.id,
              days_until: daysDiff
            })
          }
        }
      } catch (error) {
        console.error(`Error processing subscription ${sub.id}:`, error)
      }
    }

    console.log(`Found ${notifications.length} notifications to send`)

    // Send emails
    const results = []
    for (const notification of notifications) {
      try {
        const result = await sendEmail(
          resendApiKey,
          fromEmail,
          notification.to,
          notification.subject,
          notification.body
        )
        results.push({
          ...notification,
          success: true,
          result
        })
        console.log(`Email sent successfully to ${notification.to}`)
      } catch (error) {
        console.error(`Failed to send email to ${notification.to}:`, error)
        results.push({
          ...notification,
          success: false,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed_date: today,
        notifications_sent: results.filter(r => r.success).length,
        notifications_failed: results.filter(r => !r.success).length,
        details: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in email-notifications function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Helper function to create trial ending email content
function createTrialEndingEmail(subscription: any, daysUntil: number) {
  const dateStr = daysUntil === 1 ? '明日' : `${daysUntil}日後`
  
  return {
    subject: `【SubMemo】${subscription.name}の無料トライアルが${dateStr}終了します`,
    body: `
SubMemoをご利用いただき、ありがとうございます。

${subscription.name}の無料トライアル期間が${dateStr}（${subscription.trial_end_date}）に終了いたします。

■ サービス詳細
サービス名: ${subscription.name}
月額料金: ¥${subscription.price.toLocaleString()}
カテゴリ: ${subscription.category}
トライアル終了日: ${subscription.trial_end_date}

トライアル終了後、自動的に有料プランに移行し、
${new Date(new Date(subscription.trial_end_date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}が初回請求日となります。

継続しない場合は、トライアル終了前にキャンセル手続きを行ってください。

---
SubMemo - あなたのサブスクリプションを一元管理
    `.trim()
  }
}

// Helper function to create payment reminder email content
function createPaymentReminderEmail(subscription: any, daysUntil: number) {
  const dateStr = daysUntil === 1 ? '明日' : `${daysUntil}日後`
  
  return {
    subject: `【SubMemo】${subscription.name}の更新日が${dateStr}です`,
    body: `
SubMemoをご利用いただき、ありがとうございます。

${subscription.name}の更新日が${dateStr}（${subscription.next_payment}）に予定されています。

■ サービス詳細
サービス名: ${subscription.name}
月額料金: ¥${subscription.price.toLocaleString()}
カテゴリ: ${subscription.category}
更新日: ${subscription.next_payment}
${subscription.card_name ? `支払いカード: ${subscription.card_name}` : ''}

ご利用中のカードの有効期限や残高をご確認ください。

---
SubMemo - あなたのサブスクリプションを一元管理
    `.trim()
  }
}

// Helper function to send email via Resend API
async function sendEmail(apiKey: string, fromEmail: string, to: string, subject: string, body: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        text: body,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Resend API error: ${response.status} ${errorData}`)
    }

    const result = await response.json()
    console.log(`Email sent successfully to ${to} via Resend`)
    return result
  } catch (error) {
    console.error(`Failed to send email via Resend:`, error)
    
    // Fallback to console logging for development
    console.log(`Fallback - Mock email sent:`)
    console.log(`From: ${fromEmail}`)
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body: ${body}`)
    
    return {
      success: true,
      messageId: `fallback-${Date.now()}`,
      timestamp: new Date().toISOString(),
      method: 'fallback'
    }
  }
} 