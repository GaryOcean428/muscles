CREATE TABLE fitcraft_chat_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    prompt_text TEXT NOT NULL,
    user_response TEXT,
    response_type VARCHAR(50),
    is_completed BOOLEAN DEFAULT false,
    conversation_context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);