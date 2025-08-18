CREATE TABLE exercise_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    muscle_groups TEXT[] NOT NULL DEFAULT '{}',
    equipment_required TEXT[] DEFAULT '{}',
    difficulty_level TEXT NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    video_url TEXT,
    image_url TEXT,
    tips TEXT[] DEFAULT '{}',
    variations TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);