-- ==============================================================================
-- OUTBOX PATTERN (Añadido para Event-Driven Architecture)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS "outbox_events" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "aggregate_type" VARCHAR(100) NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "published" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);
