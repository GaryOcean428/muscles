Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get environment variables
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!stripeWebhookSecret || !serviceRoleKey || !supabaseUrl) {
      throw new Error('Required environment variables not configured');
    }

    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('Missing Stripe signature');
    }

    // Verify webhook signature
    const elements = signature.split(',');
    const signatureElements = elements.reduce((acc, element) => {
      const [key, value] = element.split('=');
      acc[key] = value;
      return acc;
    }, {});

    const timestamp = signatureElements.t;
    const v1 = signatureElements.v1;

    if (!timestamp || !v1) {
      throw new Error('Invalid signature format');
    }

    // Create expected signature
    const payload = timestamp + '.' + body;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(stripeWebhookSecret);
    const payloadData = encoder.encode(payload);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature_bytes = await crypto.subtle.sign('HMAC', cryptoKey, payloadData);
    const expectedSignature = Array.from(new Uint8Array(signature_bytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSignature !== v1) {
      throw new Error('Invalid signature');
    }

    // Parse the event
    const event = JSON.parse(body);
    console.log('Webhook event received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        
        // Get the subscription
        if (session.subscription) {
          const subscriptionResponse = await fetch(`https://api.stripe.com/v1/subscriptions/${session.subscription}`, {
            headers: {
              'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
            }
          });
          
          if (subscriptionResponse.ok) {
            const subscription = await subscriptionResponse.json();
            
            // Get user ID from customer email
            const customerEmail = session.customer_details?.email;
            if (customerEmail) {
              const userResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
                headers: {
                  'Authorization': `Bearer ${serviceRoleKey}`,
                  'apikey': serviceRoleKey
                }
              });
              
              if (userResponse.ok) {
                const users = await userResponse.json();
                const user = users.users?.find(u => u.email === customerEmail);
                
                if (user) {
                  // Create subscription record
                  const subscriptionData = {
                    user_id: user.id,
                    stripe_subscription_id: subscription.id,
                    stripe_customer_id: subscription.customer,
                    price_id: subscription.items.data[0].price.id,
                    status: subscription.status
                  };
                  
                  await fetch(`${supabaseUrl}/rest/v1/fitcraft_subscriptions`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${serviceRoleKey}`,
                      'apikey': serviceRoleKey,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(subscriptionData)
                  });
                  
                  console.log('Subscription record created for user:', user.id);
                }
              }
            }
          }
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id);
        
        // Update subscription status
        await fetch(`${supabaseUrl}/rest/v1/fitcraft_subscriptions?stripe_subscription_id=eq.${subscription.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: subscription.status,
            updated_at: new Date().toISOString()
          })
        });
        
        console.log('Subscription status updated to:', subscription.status);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription cancelled:', subscription.id);
        
        // Update subscription status to cancelled
        await fetch(`${supabaseUrl}/rest/v1/fitcraft_subscriptions?stripe_subscription_id=eq.${subscription.id}`, {
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
        
        console.log('Subscription marked as cancelled');
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('Payment succeeded for invoice:', invoice.id);
        
        // Update subscription status if needed
        if (invoice.subscription) {
          await fetch(`${supabaseUrl}/rest/v1/fitcraft_subscriptions?stripe_subscription_id=eq.${invoice.subscription}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'active',
              updated_at: new Date().toISOString()
            })
          });
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Payment failed for invoice:', invoice.id);
        
        // Update subscription status
        if (invoice.subscription) {
          await fetch(`${supabaseUrl}/rest/v1/fitcraft_subscriptions?stripe_subscription_id=eq.${invoice.subscription}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'past_due',
              updated_at: new Date().toISOString()
            })
          });
        }
        break;
      }
      
      default:
        console.log('Unhandled event type:', event.type);
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);

    const errorResponse = {
      error: {
        code: 'WEBHOOK_FAILED',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});