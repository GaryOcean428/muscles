CREATE TABLE exercise_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    workout_id UUID REFERENCES workouts(id),
    exercise_name VARCHAR(255),
    date_logged DATE DEFAULT CURRENT_DATE,
    sets_completed INTEGER,
    reps_completed INTEGER,
    weight_used DECIMAL(6,2),
    duration_seconds INTEGER,
    calories_burned INTEGER,
    perceived_effort INTEGER,
    notes TEXT,
    personal_record BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);