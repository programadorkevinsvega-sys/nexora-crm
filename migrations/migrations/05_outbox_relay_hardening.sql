ALTER TABLE outbox_events
    ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_error TEXT;

CREATE INDEX IF NOT EXISTS idx_outbox_events_relay_claim
    ON outbox_events (published, next_retry_at, created_at, id)
    WHERE published = false;

CREATE TABLE IF NOT EXISTS event_dead_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outbox_event_id UUID NOT NULL,
    subject VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    payload JSONB NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    source_service VARCHAR(150),
    event_type VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_dead_letters_outbox_event
    ON event_dead_letters (outbox_event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_dead_letters_source_event
    ON event_dead_letters (source_service, event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS inbox_events (
    event_id UUID NOT NULL,
    tenant_id UUID,
    source VARCHAR(150) NOT NULL,
    handler VARCHAR(150) NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (event_id, handler)
);

CREATE INDEX IF NOT EXISTS idx_inbox_events_tenant_processed
    ON inbox_events (tenant_id, processed_at DESC);
