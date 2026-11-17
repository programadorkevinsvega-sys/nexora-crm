-- ==============================================================================
-- SCRIPT: enrich_all_modules_seed.sql
-- PURPOSE: Populate realistic demo records across Deals, Support Tickets, Calls, Tasks, Notes
-- ==============================================================================

DO $$
DECLARE
  tid UUID := '00000000-0000-0000-0000-000000000001';
  uid UUID := '00000000-0000-0000-0000-000000000001';
  stripe_comp_id UUID;
  meli_comp_id UUID;
  nubank_comp_id UUID;
  rappi_comp_id UUID;
  carlos_contact_id UUID;
  mateo_contact_id UUID;
  mariana_contact_id UUID;
  valentina_contact_id UUID;
  deal_stripe_id UUID;
  deal_meli_id UUID;
  deal_nubank_id UUID;
  now_ts TIMESTAMPTZ := NOW();
BEGIN
  -- 1. Get IDs
  SELECT id INTO stripe_comp_id FROM companies WHERE name ILIKE '%Stripe%' LIMIT 1;
  SELECT id INTO meli_comp_id FROM companies WHERE name ILIKE '%MercadoLibre%' LIMIT 1;
  SELECT id INTO nubank_comp_id FROM companies WHERE name ILIKE '%Nubank%' LIMIT 1;
  SELECT id INTO rappi_comp_id FROM companies WHERE name ILIKE '%Rappi%' LIMIT 1;

  SELECT id INTO carlos_contact_id FROM contacts WHERE first_name ILIKE '%Carlos%' LIMIT 1;
  SELECT id INTO mateo_contact_id FROM contacts WHERE first_name ILIKE '%Mateo%' LIMIT 1;
  SELECT id INTO mariana_contact_id FROM contacts WHERE first_name ILIKE '%Mariana%' LIMIT 1;
  SELECT id INTO valentina_contact_id FROM contacts WHERE first_name ILIKE '%Valentina%' LIMIT 1;

  SELECT id INTO deal_stripe_id FROM deals WHERE name ILIKE '%Stripe%' LIMIT 1;
  SELECT id INTO deal_meli_id FROM deals WHERE name ILIKE '%MercadoLibre%' LIMIT 1;
  SELECT id INTO deal_nubank_id FROM deals WHERE name ILIKE '%Nubank%' LIMIT 1;

  -- 2. PIPELINE STAGES (Set is_won_stage and is_lost_stage)
  UPDATE pipeline_stages SET is_won_stage = true WHERE name ILIKE '%Ganado%' OR name ILIKE '%Won%';
  UPDATE pipeline_stages SET is_lost_stage = true WHERE name ILIKE '%Perdido%' OR name ILIKE '%Lost%';

  -- 3. SUPPORT TICKETS (Seed with channel, csat_score, company_id)
  INSERT INTO support_tickets (
    id, tenant_id, company_id, contact_id, subject, description, status, priority,
    channel, escalation_level, csat_score, resolved_at, created_at, updated_at
  ) VALUES
  (
    gen_random_uuid(), tid, stripe_comp_id, carlos_contact_id,
    'Configuración de Webhook WhatsApp Cloud API y failover',
    'Cliente solicita asistencia para configurar las respuestas automáticas con IA en sus números de soporte.',
    'RESOLVED', 'HIGH', 'WHATSAPP', 1, 5, now_ts - INTERVAL '2 hours', now_ts - INTERVAL '1 day', now_ts
  ),
  (
    gen_random_uuid(), tid, meli_comp_id, valentina_contact_id,
    'Sincronización de catálogo de productos CPQ con ERP SAP',
    'Revisión de mapeo de campos de facturación y descuentos por volumen en cotizaciones.',
    'OPEN', 'MEDIUM', 'EMAIL', 2, NULL, NULL, now_ts - INTERVAL '3 hours', now_ts
  ),
  (
    gen_random_uuid(), tid, nubank_comp_id, mateo_contact_id,
    'Consulta sobre cuotas de llamadas VoIP WebRTC y grabación',
    'El equipo de ventas reporta excelente latencia en el marcador del browser, solicitan ampliar cuota de grabación S3.',
    'RESOLVED', 'LOW', 'PORTAL', 1, 5, now_ts - INTERVAL '1 hour', now_ts - INTERVAL '2 days', now_ts
  ),
  (
    gen_random_uuid(), tid, rappi_comp_id, mariana_contact_id,
    'Incidente en firma electrónica de contrato marco Q3',
    'Verificación de token OTP para firma de representante legal.',
    'OPEN', 'URGENT', 'PHONE', 3, NULL, NULL, now_ts - INTERVAL '30 minutes', now_ts
  )
  ON CONFLICT DO NOTHING;

  -- 4. CALLS (Seed with phoneNumber, aiSummary, sentiment, deal_id, company_id, author_user_id)
  INSERT INTO calls (
    id, tenant_id, author_user_id, company_id, deal_id, contact_id, call_type, phone_number,
    call_sid, recording_url, ai_summary, sentiment, summary, happened_at, created_at
  ) VALUES
  (
    gen_random_uuid(), tid, uid, stripe_comp_id, deal_stripe_id, carlos_contact_id, 'OUTBOUND',
    '+573001112233', 'CA_STRIPE_001', 'https://cdn.nexoracrm.com/recordings/call_001.mp3',
    'El cliente confirma satisfacción con el despliegue del módulo de Forecasting. Se aprueba la extensión de contrato a 3 años.',
    'POSITIVE', 'Reunión de alineación estratégica Q3', now_ts - INTERVAL '3 hours', now_ts
  ),
  (
    gen_random_uuid(), tid, uid, meli_comp_id, deal_meli_id, valentina_contact_id, 'INBOUND',
    '+549115554422', 'CA_MELI_002', 'https://cdn.nexoracrm.com/recordings/call_002.mp3',
    'La CTO consultó tiempos de integración con su arquitectura de microservicios. Se acordó sesión técnica el viernes.',
    'POSITIVE', 'Consulta técnica de arquitectura gRPC', now_ts - INTERVAL '1 day', now_ts
  ),
  (
    gen_random_uuid(), tid, uid, nubank_comp_id, deal_nubank_id, mateo_contact_id, 'OUTBOUND',
    '+551198887766', 'CA_NUBANK_003', 'https://cdn.nexoracrm.com/recordings/call_003.mp3',
    'Validación de precios CPQ. Cliente solicitó 5% de descuento por pago anticipado anual.',
    'NEUTRAL', 'Negociación de precios y condiciones de pago', now_ts - INTERVAL '2 days', now_ts
  )
  ON CONFLICT DO NOTHING;

  -- 5. TASKS (Seed with priority, task_type, reminder_at)
  INSERT INTO tasks (
    id, tenant_id, assigned_user_id, title, description, priority, task_type,
    is_completed, due_date, created_at, updated_at
  ) VALUES
  (
    gen_random_uuid(), tid, uid,
    'Enviar propuesta formal CPQ a MercadoLibre',
    'Incluir desglose de licencias B2B y soporte 24/7 con SLA de 2 horas.',
    'HIGH', 'EMAIL', false, now_ts + INTERVAL '2 days', now_ts, now_ts
  ),
  (
    gen_random_uuid(), tid, uid,
    'Llamada de seguimiento con VP Comercial de Rappi',
    'Revisar avance en la integración de Meta Leads y WhatsApp Inbox.',
    'URGENT', 'CALL', false, now_ts + INTERVAL '1 day', now_ts, now_ts
  ),
  (
    gen_random_uuid(), tid, uid,
    'Demo de Inteligencia Artificial Radar para Nubank',
    'Presentar el motor de scoring predictivo y detección de propensión de compra.',
    'MEDIUM', 'MEETING', false, now_ts + INTERVAL '4 days', now_ts, now_ts
  ),
  (
    gen_random_uuid(), tid, uid,
    'Renovación y firma digital contrato Stripe Enterprise',
    'Contrato firmado satisfactoriamente por ambas partes.',
    'HIGH', 'FOLLOW_UP', true, now_ts - INTERVAL '1 day', now_ts, now_ts
  )
  ON CONFLICT DO NOTHING;

  -- 6. NOTES (Seed with is_pinned, is_private, sentiment)
  INSERT INTO notes (
    id, tenant_id, author_user_id, contact_id, company_id, deal_id,
    content, is_pinned, is_private, sentiment, created_at, updated_at
  ) VALUES
  (
    gen_random_uuid(), tid, uid,
    carlos_contact_id, stripe_comp_id, deal_stripe_id,
    '📌 Cuenta VIP Estratégica: Stripe tiene planeado expandir su equipo de ventas en México y Colombia en Q4. Mantener comunicación directa con Carlos Mendoza.',
    true, false, 'POSITIVE', now_ts, now_ts
  ),
  (
    gen_random_uuid(), tid, uid,
    valentina_contact_id, meli_comp_id, deal_meli_id,
    '🔒 Nota Privada de Negociación: El comité técnico requiere certificación SOC2 Type II antes del cierre. El documento ya fue enviado al equipo de compliance.',
    false, true, 'NEUTRAL', now_ts, now_ts
  ),
  (
    gen_random_uuid(), tid, uid,
    mateo_contact_id, nubank_comp_id, deal_nubank_id,
    '💡 Feedback de Producto: El equipo de Nubank destacó la rapidez del marcador VoIP en el navegador y la exactitud de los resúmenes generados con IA.',
    true, false, 'POSITIVE', now_ts, now_ts
  )
  ON CONFLICT DO NOTHING;

END $$;
