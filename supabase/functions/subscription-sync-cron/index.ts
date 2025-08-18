Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    console.log('Subscription sync cron job started at:', new Date().toISOString());

    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!stripeSecretKey || !serviceRoleKey || !supabaseUrl) {
      throw new Error('Required environment variables not configured');
    }

    // Get all active subscriptions from our database
    const subscriptionsResponse = await fetch(`${supabaseUrl}/rest/v1/fitcraft_subscriptions?status=in.(active,past_due,trialing)&select=*`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    });

    if (!subscriptionsResponse.ok) {
      throw new Error('Failed to fetch subscriptions from database');
    }

    const subscriptions = await subscriptionsResponse.json();
    console.log(`Found ${subscriptions.length} subscriptions to sync`);

    let syncedCount = 0;
    let errorCount = 0;
    const syncResults = [];

    // Process each subscription
    for (const subscription of subscriptions) {
      try {
        // Fetch latest status from Stripe
        const stripeResponse = await fetch(`https://api.stripe.com/v1/subscriptions/${subscription.stripe_subscription_id}`, {
          headers: {
            'Authorization': `Bearer ${stripeSecretKey}`
          }
        });

        if (!stripeResponse.ok) {
          if (stripeResponse.status === 404) {
            // Subscription not found in Stripe, mark as cancelled
            await fetch(`${supabaseUrl}/rest/v1/fitcraft_subscriptions?id=eq.${subscription.id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                status: 'cancelled',
                updated_at: new Date().toISOString()
              })
            });
            
            syncResults.push({
              subscription_id: subscription.id,
              action: 'marked_cancelled',
              reason: 'not_found_in_stripe'
            });
            syncedCount++;
            continue;
          }
          
          throw new Error(`Stripe API error: ${stripeResponse.status}`);
        }

        const stripeSubscription = await stripeResponse.json();
        
        // Check if status has changed
        if (stripeSubscription.status !== subscription.status) {
          console.log(`Updating subscription ${subscription.id}: ${subscription.status} -> ${stripeSubscription.status}`);
          
          // Update status in our database
          const updateResponse = await fetch(`${supabaseUrl}/rest/v1/fitcraft_subscriptions?id=eq.${subscription.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: stripeSubscription.status,
              updated_at: new Date().toISOString()
            })
          });
          
          if (!updateResponse.ok) {
            throw new Error(`Failed to update subscription ${subscription.id}`);
          }
          
          syncResults.push({
            subscription_id: subscription.id,
            action: 'status_updated',
            old_status: subscription.status,
            new_status: stripeSubscription.status
          });
          syncedCount++;
        } else {
          syncResults.push({
            subscription_id: subscription.id,
            action: 'no_change',
            status: subscription.status
          });
        }
        
        // Check if subscription is past due for more than 30 days
        if (stripeSubscription.status === 'past_due') {
          const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
          const now = new Date();
          const daysPastDue = Math.floor((now.getTime() - currentPeriodEnd.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysPastDue > 30) {
            // Cancel subscription if past due for more than 30 days
            await fetch(`https://api.stripe.com/v1/subscriptions/${subscription.stripe_subscription_id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            });
            
            await fetch(`${supabaseUrl}/rest/v1/fitcraft_subscriptions?id=eq.${subscription.id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                status: 'cancelled',
                updated_at: new Date().toISOString()
              })
            });
            
            syncResults.push({
              subscription_id: subscription.id,
              action: 'auto_cancelled',
              reason: `past_due_${daysPastDue}_days`
            });
            syncedCount++;
          }
        }
        
      } catch (subscriptionError) {
        console.error(`Error processing subscription ${subscription.id}:`, subscriptionError);
        errorCount++;
        syncResults.push({
          subscription_id: subscription.id,
          action: 'error',
          error: subscriptionError.message
        });
      }
    }

    // Clean up old flow state records (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await fetch(`${supabaseUrl}/rest/v1/ai_chat_flow_state?created_at=lt.${thirtyDaysAgo.toISOString()}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    });

    // Clean up old conversation messages (older than 90 days) 
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    await fetch(`${supabaseUrl}/rest/v1/ai_chat_messages?created_at=lt.${ninetyDaysAgo.toISOString()}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    });

    const result = {
      data: {
        success: true,
        processed: subscriptions.length,
        synced: syncedCount,
        errors: errorCount,
        timestamp: new Date().toISOString(),
        sync_results: syncResults
      }
    };

    console.log('Subscription sync completed:', result.data);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Subscription sync cron job error:', error);

    const errorResponse = {
      error: {
        code: 'SUBSCRIPTION_SYNC_FAILED',
        message: error.message,
        timestamp: new Date().toISOString()
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});