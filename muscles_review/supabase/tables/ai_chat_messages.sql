CREATE TABLE ai_chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL,
    message_type TEXT NOT NULL,
    content TEXT NOT NULL,
    is_from_ai BOOLEAN DEFAULT false,
    message_context JSONB,
    voice_input BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);