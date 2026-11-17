-- ==============================================================================
-- SLA & ALL-MODULE COMPREHENSIVE SEED SCRIPT
-- PURPOSE: Guarantee 100% complete seed data across all tables and schemas
-- ==============================================================================

DO $$
DECLARE
  tid UUID := '00000000-0000-0000-0000-000000000001';
  uid UUID := '00000000-0000-0000-0000-000000000001';
  p_critical_id UUID := '7bfae723-389d-43c7-aa47-8dbc8e92a513';
  p_high_id UUID := '741ebdb4-126d-4c66-98dc-92acaf2573c6';
  p_medium_id UUID := 'c59126c4-3191-478d-81a0-4ab2c3703445';
  t_rec RECORD;
  now_ts TIMESTAMPTZ := NOW();
BEGIN

  -- 1. ENSURE SLA POLICIES EXIST
  INSERT INTO sla_policies (id, tenant_id, name, description, priority, first_response_time_minutes, resolution_time_minutes, business_hours_only, is_default, is_active, created_at, updated_at)
  VALUES
    (p_critical_id, tid, 'SLA Premium 24/7 (Prioridad Crítica)', 'Garantía de respuesta en 15 minutos para incidentes críticos de infraestructura y pagos.', 'CRITICAL', 15, 120, false, true, true, now_ts, now_ts),
    (p_high_id, tid, 'SLA Comercial Estándar (Prioridad Alta)', 'Atención prioritaria para cotizaciones y oportunidades de ventas enterprise.', 'HIGH', 60, 480, true, false, true, now_ts, now_ts),
    (p_medium_id, tid, 'SLA General (Prioridad Media)', 'Atención estándar en horario laboral de lunes a viernes.', 'MEDIUM', 240, 1440, true, false, true, now_ts, now_ts)
  ON CONFLICT (id) DO UPDATE SET
    priority = EXCLUDED.priority,
    first_response_time_minutes = EXCLUDED.first_response_time_minutes,
    resolution_time_minutes = EXCLUDED.resolution_time_minutes,
    business_hours_only = EXCLUDED.business_hours_only,
    is_default = EXCLUDED.is_default,
    is_active = true;

  -- 2. SLA ESCALATION RULES
  DELETE FROM sla_escalation_rules WHERE tenant_id = tid;
  
  INSERT INTO sla_escalation_rules (id, tenant_id, policy_id, level, trigger_after_minutes, action_type, is_active, created_at)
  VALUES
    (gen_random_uuid(), tid, p_critical_id, 1, 10, 'NOTIFY_MANAGER', true, now_ts),
    (gen_random_uuid(), tid, p_critical_id, 2, 20, 'RAISE_PRIORITY', true, now_ts),
    (gen_random_uuid(), tid, p_critical_id, 3, 45, 'PAGE_ON_CALL', true, now_ts),
    (gen_random_uuid(), tid, p_high_id, 1, 45, 'NOTIFY_MANAGER', true, now_ts),
    (gen_random_uuid(), tid, p_high_id, 2, 120, 'REASSIGN_TEAM', true, now_ts),
    (gen_random_uuid(), tid, p_medium_id, 1, 180, 'NOTIFY_MANAGER', true, now_ts);

  -- 3. LINK SUPPORT TICKETS TO SLA POLICIES
  UPDATE support_tickets SET
    sla_policy_id = CASE 
      WHEN priority = 'CRITICAL' OR priority = 'URGENT' THEN p_critical_id
      WHEN priority = 'HIGH' THEN p_high_id
      ELSE p_medium_id
    END,
    escalation_level = 1
  WHERE tenant_id = tid;

  -- 4. TICKET SLA TRACKERS POPULATION
  DELETE FROM ticket_sla_trackers WHERE tenant_id = tid;

  FOR t_rec IN SELECT id, priority, status, created_at FROM support_tickets WHERE tenant_id = tid LOOP
    INSERT INTO ticket_sla_trackers (
      id,
      tenant_id,
      ticket_id,
      policy_id,
      first_response_due_at,
      first_responded_at,
      resolution_due_at,
      resolved_at,
      is_first_response_breached,
      is_resolution_breached,
      escalation_level_reached,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      tid,
      t_rec.id,
      CASE WHEN t_rec.priority IN ('CRITICAL', 'URGENT') THEN p_critical_id WHEN t_rec.priority = 'HIGH' THEN p_high_id ELSE p_medium_id END,
      t_rec.created_at + INTERVAL '30 minutes',
      t_rec.created_at + INTERVAL '12 minutes',
      t_rec.created_at + INTERVAL '4 hours',
      CASE WHEN t_rec.status IN ('RESOLVED', 'CLOSED') THEN t_rec.created_at + INTERVAL '2 hours' ELSE NULL END,
      false,
      false,
      1,
      now_ts
    );
  END LOOP;

  -- 5. SIMULATE 1 INTENTIONAL BREACH TRACKER (To show realistic compliance KPI ~88%)
  UPDATE ticket_sla_trackers
  SET is_resolution_breached = true, escalation_level_reached = 2
  WHERE ticket_id = (SELECT id FROM support_tickets WHERE priority = 'HIGH' LIMIT 1);

END $$;
