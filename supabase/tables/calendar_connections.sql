CREATE TABLE calendar_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    provider TEXT NOT NULL,
    external_calendar_id TEXT,
    access_token TEXT,
    refresh_token TEXT,
    sync_enabled BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);