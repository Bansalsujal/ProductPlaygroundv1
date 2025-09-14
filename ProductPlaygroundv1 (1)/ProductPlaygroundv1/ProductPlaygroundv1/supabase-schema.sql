-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    type_label TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    metadata JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create interview_sessions table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    question_id UUID,
    question_type TEXT,
    conversation JSONB,
    duration_minutes INTEGER DEFAULT 0,
    composite_score NUMERIC,
    dimension_scores JSONB,
    feedback JSONB,
    completed BOOLEAN DEFAULT false,
    date DATE,
    created_date TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_solved INTEGER DEFAULT 0,
    avg_score_design NUMERIC DEFAULT 0,
    avg_score_improvement NUMERIC DEFAULT 0,
    avg_score_rca NUMERIC DEFAULT 0,
    avg_score_guesstimate NUMERIC DEFAULT 0,
    last_activity_date DATE,
    activity_calendar JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_questions_type_label ON questions(type_label);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_created_date ON interview_sessions(created_date DESC);

-- Insert sample questions
INSERT INTO questions (question_text, type_label, difficulty, metadata) VALUES
('Design a messaging app for deaf users', 'Design', 'Medium', '{"description": "Design a messaging app specifically tailored for deaf users, considering their unique communication needs", "categories": ["Design"], "estimated_time_minutes": 30}'),
('How would you improve Instagram Stories?', 'Improvement', 'Medium', '{"description": "Analyze Instagram Stories and propose improvements to increase user engagement", "categories": ["Improvement"], "estimated_time_minutes": 25}'),
('User engagement on our social media platform dropped 20% last month. What could be the cause?', 'RCA', 'Hard', '{"description": "Root cause analysis of declining user engagement on a social media platform", "categories": ["RCA"], "estimated_time_minutes": 35}'),
('Estimate the number of pizza slices consumed in New York City per day', 'Guesstimate', 'Medium', '{"description": "Market sizing exercise for pizza consumption in NYC", "categories": ["Guesstimate"], "estimated_time_minutes": 20}'),
('Design a fitness app for busy professionals', 'Design', 'Easy', '{"description": "Design a fitness solution for time-constrained working professionals", "categories": ["Design"], "estimated_time_minutes": 30}'),
('How would you improve Uber''s driver retention?', 'Improvement', 'Hard', '{"description": "Analyze and improve driver retention rates for ride-sharing platform", "categories": ["Improvement"], "estimated_time_minutes": 40}'),
('Downloads of our mobile app decreased by 30% after the latest update. Investigate why.', 'RCA', 'Medium', '{"description": "Root cause analysis for app download decline post-update", "categories": ["RCA"], "estimated_time_minutes": 30}'),
('Estimate the market size for electric vehicle charging stations in California', 'Guesstimate', 'Hard', '{"description": "Market sizing for EV charging infrastructure in California", "categories": ["Guesstimate"], "estimated_time_minutes": 35}'),
('Design a payment system for a food delivery platform', 'Design', 'Hard', '{"description": "Design end-to-end payment system for food delivery service", "categories": ["Design"], "estimated_time_minutes": 45}'),
('How would you increase user engagement on LinkedIn?', 'Improvement', 'Easy', '{"description": "Propose strategies to boost user engagement on professional networking platform", "categories": ["Improvement"], "estimated_time_minutes": 25}'),
('Revenue from our subscription service dropped 15% this quarter. What might be causing this?', 'RCA', 'Easy', '{"description": "Root cause analysis for subscription revenue decline", "categories": ["RCA"], "estimated_time_minutes": 25}'),
('Estimate how many smartphones are sold globally per year', 'Guesstimate', 'Easy', '{"description": "Global market sizing for smartphone sales", "categories": ["Guesstimate"], "estimated_time_minutes": 20}')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Questions are viewable by everyone" ON questions FOR SELECT USING (true);
CREATE POLICY "Users can view their own sessions" ON interview_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sessions" ON interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON interview_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
