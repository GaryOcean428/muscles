CREATE TABLE ai_chat_flow_state (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    chat_step INTEGER DEFAULT 1,
    step_data JSONB,
    completed BOOLEAN DEFAULT false,
    current_step BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);