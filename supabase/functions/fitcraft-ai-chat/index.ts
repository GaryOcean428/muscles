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
    const { message, conversationId, userId, currentStep, stepData } = await req.json();

    console.log('FitCraft AI Chat request:', { userId, currentStep, messageLength: message?.length });

    if (!message || !userId) {
      throw new Error('Message and userId are required');
    }

    // Get environment variables
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Supabase configuration missing');
    }

    // Create or get conversation
    let conversation;
    if (conversationId) {
      // Get existing conversation
      const convResponse = await fetch(`${supabaseUrl}/rest/v1/ai_chat_conversations?id=eq.${conversationId}&select=*`, {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!convResponse.ok) {
        const errorText = await convResponse.text();
        throw new Error(`Failed to fetch conversation: ${errorText}`);
      }
      
      const convData = await convResponse.json();
      conversation = convData[0];
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
    } else {
      // Create new conversation
      const convResponse = await fetch(`${supabaseUrl}/rest/v1/ai_chat_conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: userId,
          conversation_title: 'FitCraft Coach Session',
          status: 'active',
          context_type: 'fitcraft_coaching',
          total_messages: 0
        })
      });
      
      if (!convResponse.ok) {
        const errorText = await convResponse.text();
        throw new Error(`Failed to create conversation: ${errorText}`);
      }
      
      const convData = await convResponse.json();
      conversation = Array.isArray(convData) ? convData[0] : convData;
      
      if (!conversation || !conversation.id) {
        console.error('Invalid conversation response:', convData);
        throw new Error('Failed to create conversation - invalid response');
      }
    }

    // Save user message
    await fetch(`${supabaseUrl}/rest/v1/ai_chat_messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversation_id: conversation.id,
        user_id: userId,
        message_type: 'user_input',
        content: message,
        is_from_ai: false,
        message_context: { step: currentStep, stepData }
      })
    });

    // Build AI context based on step
    const stepInstructions = {
      1: "You are FitCraft Coach, a friendly AI fitness trainer. Ask about their main fitness goals (lose weight, build muscle, improve endurance, etc.). Keep responses conversational and encouraging.",
      2: "Ask about their current fitness level (beginner, intermediate, advanced) and any previous workout experience.",
      3: "Inquire about available equipment (dumbbells, resistance bands, bodyweight only, gym access, etc.).",
      4: "Ask about their preferred workout duration and frequency per week.",
      5: "Discuss any injuries, limitations, or health conditions they need to consider.",
      6: "Ask about their target body areas and specific muscle groups they want to focus on.",
      7: "Inquire about their preferred workout times and schedule.",
      8: "Discuss their nutrition goals and dietary preferences.",
      9: "Ask about their experience level with different workout types (HIIT, strength training, yoga, etc.).",
      10: "Gather information about their lifestyle and activity level outside of workouts.",
      11: "Ask about their motivation and what keeps them committed to fitness.",
      12: "Summarize their profile and provide personalized recommendations for their fitness journey."
    };

    const systemPrompt = `You are FitCraft Coach, an expert AI personal trainer with years of experience helping people achieve their fitness goals. You are currently in step ${currentStep} of a 12-step onboarding process.

Step ${currentStep} Instructions: ${stepInstructions[currentStep] || "Continue the conversation naturally, gathering fitness information and providing guidance."}

Guidelines:
- Be encouraging, friendly, and professional
- Ask one focused question at a time
- Provide brief explanations when helpful
- Keep responses concise but informative
- Show enthusiasm for their fitness journey
- Adapt your language to their fitness level
- If they seem confused, provide clarification

Current conversation context: ${JSON.stringify(stepData)}

User's message: "${message}"

Respond appropriately for this step of the onboarding process.`;

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', errorText);
      throw new Error(`AI service error: ${errorText}`);
    }

    const groqData = await groqResponse.json();
    const aiResponse = groqData.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI service');
    }

    // Save AI response
    await fetch(`${supabaseUrl}/rest/v1/ai_chat_messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversation_id: conversation.id,
        user_id: userId,
        message_type: 'ai_response',
        content: aiResponse,
        is_from_ai: true,
        message_context: { step: currentStep },
        processed_at: new Date().toISOString()
      })
    });

    // Update conversation message count
    await fetch(`${supabaseUrl}/rest/v1/ai_chat_conversations?id=eq.${conversation.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        total_messages: (conversation.total_messages || 0) + 2,
        last_message_at: new Date().toISOString()
      })
    });

    // Update flow state
    let nextStep = currentStep;
    if (currentStep < 12) {
      nextStep = currentStep + 1;
    }

    await fetch(`${supabaseUrl}/rest/v1/ai_chat_flow_state`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        chat_step: nextStep,
        step_data: { ...stepData, [currentStep]: message },
        completed: nextStep > 12,
        current_step: true
      })
    });

    const result = {
      data: {
        response: aiResponse,
        conversationId: conversation.id,
        currentStep: nextStep,
        completed: nextStep > 12
      }
    };

    console.log('FitCraft AI Chat completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('FitCraft AI Chat error:', error);

    const errorResponse = {
      error: {
        code: 'FITCRAFT_AI_CHAT_FAILED',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});