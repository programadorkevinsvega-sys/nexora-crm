-- Workflow persistence integrity for phase 1.1.
-- Existing workflow tables were introduced in 0034; this migration hardens them
-- without recreating data or changing the application-level workflow runtime.

-- Composite unique keys allow PostgreSQL to enforce tenant and source-version
-- consistency on the child records.
CREATE UNIQUE INDEX IF NOT EXISTS workflow_definitions_tenant_id_version_unique
  ON public.workflow_definitions (tenant_id, id, version);

CREATE UNIQUE INDEX IF NOT EXISTS workflow_executions_tenant_id_unique
  ON public.workflow_executions (tenant_id, id);

-- Every workflow record must belong to an existing tenant.
ALTER TABLE public.workflow_definitions
  ADD CONSTRAINT workflow_definitions_tenant_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants.tenants (id)
  ON DELETE RESTRICT NOT VALID;
ALTER TABLE public.workflow_definitions
  VALIDATE CONSTRAINT workflow_definitions_tenant_id_fk;

ALTER TABLE public.workflow_executions
  ADD CONSTRAINT workflow_executions_tenant_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants.tenants (id)
  ON DELETE RESTRICT NOT VALID;
ALTER TABLE public.workflow_executions
  VALIDATE CONSTRAINT workflow_executions_tenant_id_fk;

ALTER TABLE public.workflow_step_executions
  ADD CONSTRAINT workflow_step_executions_tenant_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants.tenants (id)
  ON DELETE RESTRICT NOT VALID;
ALTER TABLE public.workflow_step_executions
  VALIDATE CONSTRAINT workflow_step_executions_tenant_id_fk;

-- An execution is pinned to one exact immutable definition version in its tenant.
ALTER TABLE public.workflow_executions
  DROP CONSTRAINT IF EXISTS workflow_executions_workflow_id_fkey;
ALTER TABLE public.workflow_executions
  DROP CONSTRAINT IF EXISTS workflow_executions_workflow_id_workflow_definitions_id_fk;
ALTER TABLE public.workflow_executions
  ADD CONSTRAINT workflow_executions_tenant_workflow_version_fk
  FOREIGN KEY (tenant_id, workflow_id, version)
  REFERENCES public.workflow_definitions (tenant_id, id, version)
  ON DELETE RESTRICT NOT VALID;
ALTER TABLE public.workflow_executions
  VALIDATE CONSTRAINT workflow_executions_tenant_workflow_version_fk;

-- A step execution must belong to an execution in the same tenant. Keep its
-- history instead of cascading deletion from an execution.
ALTER TABLE public.workflow_step_executions
  DROP CONSTRAINT IF EXISTS workflow_step_executions_execution_id_fkey;
ALTER TABLE public.workflow_step_executions
  DROP CONSTRAINT IF EXISTS workflow_step_executions_execution_id_workflow_executions_id_fk;
ALTER TABLE public.workflow_step_executions
  ADD CONSTRAINT workflow_step_executions_tenant_execution_fk
  FOREIGN KEY (tenant_id, execution_id)
  REFERENCES public.workflow_executions (tenant_id, id)
  ON DELETE RESTRICT NOT VALID;
ALTER TABLE public.workflow_step_executions
  VALIDATE CONSTRAINT workflow_step_executions_tenant_execution_fk;

-- Status and idempotency invariants are checked by PostgreSQL as well as by
-- the domain types. NOT VALID permits a controlled validation of existing rows.
ALTER TABLE public.workflow_definitions
  ADD CONSTRAINT workflow_definitions_version_check CHECK (version > 0) NOT VALID;
ALTER TABLE public.workflow_definitions
  VALIDATE CONSTRAINT workflow_definitions_version_check;

ALTER TABLE public.workflow_definitions
  ADD CONSTRAINT workflow_definitions_status_check
  CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED')) NOT VALID;
ALTER TABLE public.workflow_definitions
  VALIDATE CONSTRAINT workflow_definitions_status_check;

ALTER TABLE public.workflow_executions
  ADD CONSTRAINT workflow_executions_version_check CHECK (version > 0) NOT VALID;
ALTER TABLE public.workflow_executions
  VALIDATE CONSTRAINT workflow_executions_version_check;

ALTER TABLE public.workflow_executions
  ADD CONSTRAINT workflow_executions_status_check
  CHECK (status IN ('RUNNING', 'WAITING_DELAY', 'COMPLETED', 'CANCELLED', 'FAILED')) NOT VALID;
ALTER TABLE public.workflow_executions
  VALIDATE CONSTRAINT workflow_executions_status_check;

ALTER TABLE public.workflow_step_executions
  ADD CONSTRAINT workflow_step_executions_status_check
  CHECK (status IN ('PENDING', 'EXECUTING', 'SUCCESS', 'FAILED', 'SKIPPED')) NOT VALID;
ALTER TABLE public.workflow_step_executions
  VALIDATE CONSTRAINT workflow_step_executions_status_check;

ALTER TABLE public.workflow_step_executions
  ADD CONSTRAINT workflow_step_executions_attempts_check CHECK (attempts > 0) NOT VALID;
ALTER TABLE public.workflow_step_executions
  VALIDATE CONSTRAINT workflow_step_executions_attempts_check;

ALTER TABLE public.workflow_step_executions
  ADD CONSTRAINT workflow_step_executions_idempotency_key_check
  CHECK (idempotency_key = execution_id::text || '_' || step_id || '_' || attempts::text) NOT VALID;
ALTER TABLE public.workflow_step_executions
  VALIDATE CONSTRAINT workflow_step_executions_idempotency_key_check;

-- Definition content is append-only. Only a controlled lifecycle status
-- transition may update an existing row; edits require a new version row.
CREATE OR REPLACE FUNCTION public.enforce_workflow_definition_immutability()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Workflow definition versions cannot be deleted; archive the version instead'
      USING ERRCODE = '55000';
  END IF;

  IF ROW(
    NEW.id,
    NEW.tenant_id,
    NEW.name,
    NEW.description,
    NEW.version,
    NEW.trigger_event,
    NEW.trigger_filter,
    NEW.steps_graph,
    NEW.created_at
  ) IS DISTINCT FROM ROW(
    OLD.id,
    OLD.tenant_id,
    OLD.name,
    OLD.description,
    OLD.version,
    OLD.trigger_event,
    OLD.trigger_filter,
    OLD.steps_graph,
    OLD.created_at
  ) THEN
    RAISE EXCEPTION 'Workflow definition versions are immutable; create a new version instead'
      USING ERRCODE = '55000';
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT (
      (OLD.status = 'DRAFT' AND NEW.status IN ('ACTIVE', 'ARCHIVED'))
      OR (OLD.status = 'ACTIVE' AND NEW.status IN ('PAUSED', 'ARCHIVED'))
      OR (OLD.status = 'PAUSED' AND NEW.status IN ('ACTIVE', 'ARCHIVED'))
    ) THEN
      RAISE EXCEPTION 'Invalid workflow status transition: % -> %', OLD.status, NEW.status
        USING ERRCODE = '23514';
    END IF;
    NEW.updated_at := GREATEST(COALESCE(NEW.updated_at, clock_timestamp()), clock_timestamp());
  ELSIF NEW.updated_at IS DISTINCT FROM OLD.updated_at THEN
    RAISE EXCEPTION 'Workflow updated_at can change only with a valid status transition'
      USING ERRCODE = '55000';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workflow_definitions_immutable_trigger ON public.workflow_definitions;
CREATE TRIGGER workflow_definitions_immutable_trigger
BEFORE UPDATE OR DELETE ON public.workflow_definitions
FOR EACH ROW
EXECUTE FUNCTION public.enforce_workflow_definition_immutability();

-- Execution identity and the definition version it references are immutable;
-- only runtime progress and result fields may be updated.
CREATE OR REPLACE FUNCTION public.enforce_workflow_execution_identity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Workflow execution history cannot be deleted'
      USING ERRCODE = '55000';
  END IF;

  IF ROW(
    NEW.id,
    NEW.tenant_id,
    NEW.workflow_id,
    NEW.version,
    NEW.entity_type,
    NEW.entity_id,
    NEW.started_at
  ) IS DISTINCT FROM ROW(
    OLD.id,
    OLD.tenant_id,
    OLD.workflow_id,
    OLD.version,
    OLD.entity_type,
    OLD.entity_id,
    OLD.started_at
  ) THEN
    RAISE EXCEPTION 'Workflow execution identity and source version are immutable'
      USING ERRCODE = '55000';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workflow_executions_identity_trigger ON public.workflow_executions;
CREATE TRIGGER workflow_executions_identity_trigger
BEFORE UPDATE OR DELETE ON public.workflow_executions
FOR EACH ROW
EXECUTE FUNCTION public.enforce_workflow_execution_identity();

-- The step idempotency identity is append-only. A retry is a new row with a
-- new attempt number and therefore a different idempotency key.
CREATE OR REPLACE FUNCTION public.enforce_workflow_step_execution_identity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Workflow step execution history cannot be deleted'
      USING ERRCODE = '55000';
  END IF;

  IF ROW(
    NEW.id,
    NEW.tenant_id,
    NEW.execution_id,
    NEW.step_id,
    NEW.idempotency_key,
    NEW.attempts,
    NEW.started_at
  ) IS DISTINCT FROM ROW(
    OLD.id,
    OLD.tenant_id,
    OLD.execution_id,
    OLD.step_id,
    OLD.idempotency_key,
    OLD.attempts,
    OLD.started_at
  ) THEN
    RAISE EXCEPTION 'Workflow step execution identity and idempotency key are immutable'
      USING ERRCODE = '55000';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workflow_step_executions_identity_trigger ON public.workflow_step_executions;
CREATE TRIGGER workflow_step_executions_identity_trigger
BEFORE UPDATE OR DELETE ON public.workflow_step_executions
FOR EACH ROW
EXECUTE FUNCTION public.enforce_workflow_step_execution_identity();

-- RLS is enabled and forced so the application role cannot read or mutate
-- another tenant's workflow rows. Repositories set app.tenant_id transaction-
-- locally before every operation, preventing pooled-connection leakage.
ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_definitions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workflow_definitions_tenant_isolation ON public.workflow_definitions;
CREATE POLICY workflow_definitions_tenant_isolation
  ON public.workflow_definitions
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workflow_executions_tenant_isolation ON public.workflow_executions;
CREATE POLICY workflow_executions_tenant_isolation
  ON public.workflow_executions
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE public.workflow_step_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_step_executions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workflow_step_executions_tenant_isolation ON public.workflow_step_executions;
CREATE POLICY workflow_step_executions_tenant_isolation
  ON public.workflow_step_executions
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
