-- Migration: Add analytics events table
-- Description: Creates analytics_events table for privacy-safe event tracking

CREATE TABLE analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255), -- Anonymized user ID (not email/username)
    language VARCHAR(10) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    details JSONB NOT NULL DEFAULT '{}', -- Flexible event data
    user_agent TEXT,
    ip_address VARCHAR(255), -- Hashed/anonymized IP for privacy
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Add composite indexes for common queries
CREATE INDEX idx_analytics_events_type_timestamp ON analytics_events(event_type, timestamp);
CREATE INDEX idx_analytics_events_user_timestamp ON analytics_events(user_id, timestamp);
