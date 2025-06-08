import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get current time in JST
    const now = new Date()
    const jst = new Date(now.getTime() + (9 * 60 * 60 * 1000)) // JST is UTC+9
    const currentHour = jst.getHours()
    
    console.log(`Scheduler triggered at JST hour: ${currentHour}`)

    // Check if it's 21:00 JST (9 PM)
    if (currentHour === 21) {
      console.log('Triggering email notifications...')
      
      // Call the email-notifications function
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const emailFunctionUrl = `${supabaseUrl}/functions/v1/email-notifications`
      
      const response = await fetch(emailFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trigger: 'scheduled',
          timestamp: jst.toISOString()
        })
      })

      const result = await response.json()
      
      return new Response(
        JSON.stringify({
          success: true,
          triggered_at: jst.toISOString(),
          email_function_result: result
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Not scheduled time. Current JST hour: ${currentHour}, target: 21`,
          current_time_jst: jst.toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

  } catch (error) {
    console.error('Error in daily-notification-scheduler:', error)
    
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