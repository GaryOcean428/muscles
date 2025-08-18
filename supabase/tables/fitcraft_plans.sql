CREATE TABLE fitcraft_plans (
    id SERIAL PRIMARY KEY,
    price_id TEXT UNIQUE NOT NULL,
    plan_type TEXT NOT NULL,
    price INTEGER NOT NULL,
    monthly_limit INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);