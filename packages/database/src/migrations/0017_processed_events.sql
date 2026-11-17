-- Migration: 0017_processed_events.sql
CREATE TABLE IF NOT EXISTS processed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(150) NOT NULL,
  consumer_group VARCHAR(100) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_processed_events_dedup ON processed_events (event_id, consumer_group);
CREATE INDEX IF NOT EXISTS idx_processed_events_event_type ON processed_events (event_type);
CREATE INDEX IF NOT EXISTS idx_processed_events_processed_at ON processed_events (processed_at);
