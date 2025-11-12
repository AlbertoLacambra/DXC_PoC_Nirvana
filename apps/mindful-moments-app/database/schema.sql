-- Mindful Moments Database Schema
-- PostgreSQL 15

CREATE TABLE IF NOT EXISTS moments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_moments_created_at ON moments(created_at DESC);

-- Sample data
INSERT INTO moments (title, content, image_url) VALUES
    ('Morning Meditation', 'Started the day with 10 minutes of mindful breathing. Feeling centered and calm.', NULL),
    ('Gratitude Practice', 'Three things I''m grateful for today: health, family, and the beautiful sunrise.', NULL),
    ('Mindful Walk', 'Took a 20-minute walk in nature, focusing on each step and the sounds around me.', NULL),
    ('Breathing Exercise', 'Box breathing: 4-4-4-4. Helped reduce stress before an important meeting.', NULL),
    ('Evening Reflection', 'Reflected on the day. Acknowledged challenges and celebrated small wins.', NULL);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for automatic updated_at updates
CREATE TRIGGER update_moments_updated_at BEFORE UPDATE ON moments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
