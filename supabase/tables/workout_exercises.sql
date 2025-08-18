CREATE TABLE workout_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_id UUID NOT NULL,
    exercise_template_id UUID,
    exercise_name TEXT NOT NULL,
    exercise_type TEXT NOT NULL,
    sets INTEGER,
    reps TEXT,
    weight_percentage DECIMAL(5,2),
    rest_time_seconds INTEGER,
    duration INTEGER,
    notes TEXT,
    order_index INTEGER NOT NULL,
    equipment_required TEXT[] DEFAULT '{}',
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);