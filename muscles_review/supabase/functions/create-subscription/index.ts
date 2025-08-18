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
    const { planType, customerEmail } = await req.json();

    console.log('Subscription creation request:', { planType, customerEmail });

    if (!planType || !customerEmail) {
      throw new Error('Plan type and customer email are required');
    }

    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Supabase configuration missing');
    }

    // Get the plan from database
    const planResponse = await fetch(`${supabaseUrl}/rest/v1/fitcraft_plans?plan_type=eq.${planType}&select=*`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    });

    if (!planResponse.ok) {
      throw new Error('Failed to fetch plan details');
    }

    const planData = await planResponse.json();
    const plan = planData[0];

    if (!plan) {
      throw new Error(`Plan ${planType} not found`);
    }

    console.log('Found plan:', { plan_type: plan.plan_type, price_id: plan.price_id });

    // Create or get customer
    let customerId;
    
    // Search for existing customer
    const customerSearchParams = new URLSearchParams();
    customerSearchParams.append('email', customerEmail);
    
    const customerSearchResponse = await fetch(`https://api.stripe.com/v1/customers/search?${customerSearchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!customerSearchResponse.ok) {
      throw new Error('Failed to search for customer');
    }

    const customerSearchData = await customerSearchResponse.json();
    
    if (customerSearchData.data && customerSearchData.data.length > 0) {
      customerId = customerSearchData.data[0].id;
      console.log('Found existing customer:', customerId);
    } else {
      // Create new customer
      const customerParams = new URLSearchParams();
      customerParams.append('email', customerEmail);
      customerParams.append('metadata[source]', 'fitcraft_app');

      const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: customerParams.toString()
      });

      if (!customerResponse.ok) {
        const errorText = await customerResponse.text();
        throw new Error(`Failed to create customer: ${errorText}`);
      }

      const customerData = await customerResponse.json();
      customerId = customerData.id;
      console.log('Created new customer:', customerId);
    }

    // Create checkout session
    const sessionParams = new URLSearchParams();
    sessionParams.append('mode', 'subscription');
    sessionParams.append('customer', customerId);
    sessionParams.append('line_items[0][price]', plan.price_id);
    sessionParams.append('line_items[0][quantity]', '1');
    sessionParams.append('success_url', `${req.headers.get('origin')}/subscription?subscription=success`);
    sessionParams.append('cancel_url', `${req.headers.get('origin')}/subscription?subscription=cancelled`);
    sessionParams.append('metadata[plan_type]', planType);
    sessionParams.append('metadata[customer_email]', customerEmail);
    sessionParams.append('subscription_data[metadata][plan_type]', planType);
    sessionParams.append('subscription_data[metadata][source]', 'fitcraft_app');

    const sessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: sessionParams.toString()
    });

    console.log('Stripe checkout session response status:', sessionResponse.status);

    if (!sessionResponse.ok) {
      const errorText = await sessionResponse.text();
      console.error('Stripe checkout session error:', errorText);
      throw new Error(`Failed to create checkout session: ${errorText}`);
    }

    const sessionData = await sessionResponse.json();
    console.log('Checkout session created successfully:', sessionData.id);

    const result = {
      data: {
        checkoutUrl: sessionData.url,
        sessionId: sessionData.id,
        customerId: customerId,
        planType: planType
      }
    };

    console.log('Subscription creation completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Create subscription error:', error);

    const errorResponse = {
      error: {
        code: 'SUBSCRIPTION_CREATION_FAILED',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});