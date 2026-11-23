-- Persist the due time for a workflow delay independently of Redis.
-- This lets workers validate delayed jobs against the durable execution state.
ALTER TABLE public.workflow_executions
  ADD COLUMN IF NOT EXISTS resume_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS workflow_executions_waiting_resume_idx
  ON public.workflow_executions (tenant_id, resume_at)
  WHERE status = 'WAITING_DELAY' AND resume_at IS NOT NULL;
