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
    const { userId, workoutType, duration, fitnessLevel, bodyType, equipment, targetMuscles, goals, injuries } = await req.json();

    console.log('AI Workout Generation request:', { userId, workoutType, duration, fitnessLevel });

    if (!userId || !workoutType) {
      throw new Error('UserId and workoutType are required');
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

    // Build detailed prompt for workout generation
    const workoutPrompt = `You are an expert personal trainer and exercise physiologist. Generate a comprehensive, personalized workout plan based on the following user profile:

**User Profile:**
- Workout Type: ${workoutType}
- Duration: ${duration || 45} minutes
- Fitness Level: ${fitnessLevel || 'intermediate'}
- Body Type: ${bodyType || 'mesomorph'}
- Available Equipment: ${equipment?.join(', ') || 'bodyweight'}
- Target Muscles: ${targetMuscles?.join(', ') || 'full body'}
- Goals: ${goals?.join(', ') || 'general fitness'}
- Injuries/Limitations: ${injuries || 'none'}

**Requirements:**
1. Create a structured workout with warm-up, main workout, and cool-down phases
2. Include specific exercises with sets, reps, and rest periods
3. Provide detailed instructions for each exercise
4. Consider the user's fitness level and limitations
5. Ensure exercises match available equipment
6. Include modifications for different skill levels
7. Add coaching tips and progression notes

**Response Format (JSON):**
{
  "workoutName": "Descriptive workout name",
  "workoutType": "${workoutType}",
  "estimatedDuration": ${duration || 45},
  "difficultyLevel": "${fitnessLevel || 'intermediate'}",
  "targetMuscles": ["list", "of", "target", "muscles"],
  "phases": {
    "warmUp": {
      "duration": 5,
      "exercises": [
        {
          "name": "Exercise name",
          "duration": 60,
          "instructions": "Detailed instructions",
          "modifications": "Easier/harder variations"
        }
      ]
    },
    "mainWorkout": {
      "duration": 30,
      "exercises": [
        {
          "name": "Exercise name",
          "sets": 3,
          "reps": "10-12",
          "rest": 60,
          "equipment": ["required equipment"],
          "instructions": "Detailed form cues and technique",
          "modifications": "Progression and regression options"
        }
      ]
    },
    "coolDown": {
      "duration": 10,
      "exercises": [
        {
          "name": "Stretch/recovery exercise",
          "duration": 30,
          "instructions": "How to perform the stretch",
          "modifications": "Variations for flexibility levels"
        }
      ]
    }
  },
  "coachingTips": [
    "Important tip 1",
    "Form cue 2",
    "Motivation point 3"
  ],
  "progressionNotes": "How to progress this workout over time"
}

Generate a complete, safe, and effective workout plan. Respond only with valid JSON.`;

    // Call Groq API for workout generation
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are an expert personal trainer. Generate workout plans in valid JSON format only. No additional text or explanations.' },
          { role: 'user', content: workoutPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', errorText);
      throw new Error(`AI service error: ${errorText}`);
    }

    const groqData = await groqResponse.json();
    let aiResponse = groqData.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI service');
    }

    // Clean and parse JSON response
    try {
      // Remove any markdown code block formatting
      aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const workoutData = JSON.parse(aiResponse);
      
      // Validate required fields
      if (!workoutData.workoutName || !workoutData.phases) {
        throw new Error('Invalid workout structure from AI');
      }

      // Save the generated workout to database
      const workoutRecord = {
        user_id: userId,
        name: workoutData.workoutName,
        description: `AI-generated ${workoutType} workout`,
        workout_type: workoutType,
        duration_minutes: workoutData.estimatedDuration,
        difficulty_level: workoutData.difficultyLevel,
        target_muscles: workoutData.targetMuscles,
        is_generated: true,
        ai_model_used: 'llama-3.1-8b-instant',
        status: 'ready'
      };

      const workoutResponse = await fetch(`${supabaseUrl}/rest/v1/workouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(workoutRecord)
      });

      if (!workoutResponse.ok) {
        const errorText = await workoutResponse.text();
        console.error('Failed to save workout:', errorText);
        // Continue even if save fails
      } else {
        const savedWorkout = await workoutResponse.json();
        console.log('Workout saved successfully:', savedWorkout[0]?.id);
      }

      const result = {
        data: {
          workout: workoutData,
          success: true
        }
      };

      console.log('Workout generation completed successfully');

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw AI response:', aiResponse);
      throw new Error(`Failed to parse workout data: ${parseError.message}`);
    }

  } catch (error) {
    console.error('AI Workout Generation error:', error);

    const errorResponse = {
      error: {
        code: 'WORKOUT_GENERATION_FAILED',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});