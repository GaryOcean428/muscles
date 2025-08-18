CREATE TABLE workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    workout_type TEXT NOT NULL,
    duration_minutes INTEGER,
    difficulty_level TEXT,
    target_muscles TEXT[] DEFAULT '{}',
    calories_target INTEGER,
    is_generated BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    ai_model_used TEXT,
    status TEXT DEFAULT 'draft',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);