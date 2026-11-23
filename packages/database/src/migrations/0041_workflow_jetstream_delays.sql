-- Persisted workflow delay scheduling and resumable execution identity.
-- Existing executions are preserved; historical WAITING_DELAY rows without
-- resume_at remain visible for manual reconciliation and are not fabricated.
ALTER TABLE public.workflow_executions
  ADD COLUMN IF NOT EXISTS resume_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resume_token UUID;

CREATE INDEX IF NOT EXISTS workflow_executions_resume_at_idx
  ON public.workflow_executions (resume_at);
