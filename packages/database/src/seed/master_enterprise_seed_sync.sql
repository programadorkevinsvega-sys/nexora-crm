-- ==============================================================================
-- MASTER ENTERPRISE DATABASE SEED & COMPLETE SYNC SCRIPT
-- PURPOSE: Guarantee 100% non-empty, rich, consistent enterprise data
-- ==============================================================================

DO $$
DECLARE
  tid UUID := '00000000-0000-0000-0000-000000000001';
  uid UUID := '00000000-0000-0000-0000-000000000001';
  now_ts TIMESTAMPTZ := NOW();
BEGIN

  -- 1. CLEAN & SYNC PIPELINE STAGES
  UPDATE pipeline_stages SET
    is_won_stage = CASE WHEN name ILIKE '%Ganado%' OR name ILIKE '%Won%' THEN true ELSE false END,
    is_lost_stage = CASE WHEN name ILIKE '%Perdido%' OR name ILIKE '%Lost%' THEN true ELSE false END;

  -- 2. COMPANIES COMPLETE FILL
  UPDATE companies SET
    phone = CASE 
      WHEN name ILIKE '%Stripe%' THEN '+57 601 3110001'
      WHEN name ILIKE '%MercadoLibre%' THEN '+54 11 40001111'
      WHEN name ILIKE '%Nubank%' THEN '+55 11 50002222'
      WHEN name ILIKE '%Rappi%' THEN '+57 601 7000333'
      WHEN name ILIKE '%CloudScale%' THEN '+1 415 5550199'
      ELSE '+52 55 88883322'
    END,
    email = CASE 
      WHEN name ILIKE '%Stripe%' THEN 'latam@stripe.com'
      WHEN name ILIKE '%MercadoLibre%' THEN 'corporate@mercadolibre.com'
      WHEN name ILIKE '%Nubank%' THEN 'enterprise@nubank.com'
      WHEN name ILIKE '%Rappi%' THEN 'partners@rappi.com'
      WHEN name ILIKE '%CloudScale%' THEN 'sales@cloudscale.io'
      ELSE 'contacto@biohealth.org'
    END,
    country = CASE 
      WHEN name ILIKE '%Stripe%' THEN 'Colombia'
      WHEN name ILIKE '%MercadoLibre%' THEN 'Argentina'
      WHEN name ILIKE '%Nubank%' THEN 'Brasil'
      WHEN name ILIKE '%Rappi%' THEN 'Colombia'
      WHEN name ILIKE '%CloudScale%' THEN 'Estados Unidos'
      ELSE 'México'
    END,
    city = CASE 
      WHEN name ILIKE '%Stripe%' THEN 'Bogotá'
      WHEN name ILIKE '%MercadoLibre%' THEN 'Buenos Aires'
      WHEN name ILIKE '%Nubank%' THEN 'São Paulo'
      WHEN name ILIKE '%Rappi%' THEN 'Bogotá'
      WHEN name ILIKE '%CloudScale%' THEN 'San Francisco'
      ELSE 'Ciudad de México'
    END,
    address = CASE 
      WHEN name ILIKE '%Stripe%' THEN 'Cra 7 # 71-21 Torre A, Piso 12'
      WHEN name ILIKE '%MercadoLibre%' THEN 'Av. Caseros 3039, Parque Patricios'
      WHEN name ILIKE '%Nubank%' THEN 'Rua Capote Valente 39, Pinheiros'
      WHEN name ILIKE '%Rappi%' THEN 'Calle 93B # 19-36'
      WHEN name ILIKE '%CloudScale%' THEN '500 Howard St, Suite 400'
      ELSE 'Paseo de la Reforma 222'
    END,
    tier = CASE 
      WHEN name ILIKE '%Stripe%' OR name ILIKE '%MercadoLibre%' OR name ILIKE '%Nubank%' THEN 'TIER_1_VIP'
      WHEN name ILIKE '%Rappi%' OR name ILIKE '%CloudScale%' THEN 'TIER_2'
      ELSE 'TIER_3'
    END,
    lifecycle_stage = CASE 
      WHEN name ILIKE '%Stripe%' OR name ILIKE '%Nubank%' THEN 'CUSTOMER'
      WHEN name ILIKE '%MercadoLibre%' THEN 'PROSPECT'
      WHEN name ILIKE '%Rappi%' THEN 'LEAD'
      WHEN name ILIKE '%CloudScale%' THEN 'PARTNER'
      ELSE 'PROSPECT'
    END,
    health_score = CASE 
      WHEN name ILIKE '%Stripe%' THEN 98
      WHEN name ILIKE '%Nubank%' THEN 95
      WHEN name ILIKE '%CloudScale%' THEN 91
      WHEN name ILIKE '%MercadoLibre%' THEN 87
      WHEN name ILIKE '%Rappi%' THEN 78
      ELSE 74
    END,
    annual_revenue = CASE 
      WHEN name ILIKE '%MercadoLibre%' THEN 85000000.00
      WHEN name ILIKE '%Nubank%' THEN 45000000.00
      WHEN name ILIKE '%Rappi%' THEN 28000000.00
      WHEN name ILIKE '%BioHealth%' THEN 19000000.00
      WHEN name ILIKE '%Stripe%' THEN 12500000.00
      ELSE 8500000.00
    END,
    linkedin_url = CASE 
      WHEN name ILIKE '%Stripe%' THEN 'https://linkedin.com/company/stripe'
      WHEN name ILIKE '%MercadoLibre%' THEN 'https://linkedin.com/company/mercadolibre'
      WHEN name ILIKE '%Nubank%' THEN 'https://linkedin.com/company/nubank'
      WHEN name ILIKE '%Rappi%' THEN 'https://linkedin.com/company/rappi'
      WHEN name ILIKE '%CloudScale%' THEN 'https://linkedin.com/company/cloudscale'
      ELSE 'https://linkedin.com/company/biohealth'
    END;

  -- 3. CONTACTS COMPLETE FILL
  UPDATE contacts SET
    whatsapp_number = COALESCE(NULLIF(whatsapp_number, ''), REPLACE(REPLACE(phone, '-', ''), ' ', '')),
    lead_score = CASE WHEN lead_score IS NULL OR lead_score = 0 THEN FLOOR(RANDOM() * 30 + 70)::int ELSE lead_score END,
    preferred_language = CASE WHEN country = 'Brasil' THEN 'PT' WHEN country = 'Estados Unidos' THEN 'EN' ELSE 'ES' END,
    timezone = CASE 
      WHEN country = 'Argentina' THEN 'America/Argentina/Buenos_Aires'
      WHEN country = 'Brasil' THEN 'America/Sao_Paulo'
      WHEN country = 'México' THEN 'America/Mexico_City'
      WHEN country = 'Estados Unidos' THEN 'America/Los_Angeles'
      ELSE 'America/Bogota'
    END,
    linkedin_url = COALESCE(NULLIF(linkedin_url, ''), 'https://linkedin.com/in/' || LOWER(first_name) || '-' || LOWER(COALESCE(last_name, 'contact'))),
    lead_status = COALESCE(NULLIF(lead_status, ''), 'CUSTOMER');

  -- 4. DEALS COMPLETE FILL
  UPDATE deals SET
    currency = COALESCE(NULLIF(currency, ''), 'USD'),
    forecast_category = CASE 
      WHEN status = 'WON' THEN 'CLOSED'
      WHEN amount >= 100000 THEN 'COMMIT'
      WHEN amount >= 40000 THEN 'BEST_CASE'
      ELSE 'PIPELINE'
    END,
    probability_override = CASE 
      WHEN status = 'WON' THEN 100
      WHEN amount >= 100000 THEN 85
      WHEN amount >= 40000 THEN 60
      ELSE 30
    END,
    actual_close_date = CASE WHEN status = 'WON' THEN now_ts - INTERVAL '15 days' ELSE NULL END,
    loss_reason = CASE WHEN status = 'LOST' THEN 'Presupuesto congelado para Q3' ELSE NULL END;

  -- 5. SUPPORT TICKETS COMPLETE FILL
  UPDATE support_tickets SET
    channel = COALESCE(NULLIF(channel, ''), 'WHATSAPP'),
    escalation_level = COALESCE(escalation_level, 1),
    csat_score = CASE WHEN status = 'RESOLVED' OR status = 'CLOSED' THEN 5 ELSE NULL END,
    resolved_at = CASE WHEN status = 'RESOLVED' THEN now_ts - INTERVAL '2 hours' ELSE NULL END;

  -- 6. CALLS COMPLETE FILL
  UPDATE calls SET
    phone_number = COALESCE(NULLIF(phone_number, ''), '+57 300 123 4567'),
    call_sid = COALESCE(NULLIF(call_sid, ''), 'CA_' || SUBSTRING(id::text, 1, 8)),
    recording_url = COALESCE(NULLIF(recording_url, ''), 'https://cdn.nexoracrm.com/recordings/' || SUBSTRING(id::text, 1, 8) || '.mp3'),
    sentiment = COALESCE(NULLIF(sentiment, ''), 'POSITIVE'),
    ai_summary = COALESCE(NULLIF(ai_summary, ''), 'Conversación comercial productiva. Se definieron los próximos pasos de la propuesta y se agendó reunión técnica.');

  -- 7. TASKS COMPLETE FILL
  UPDATE tasks SET
    task_type = COALESCE(NULLIF(task_type, ''), 'FOLLOW_UP'),
    priority = COALESCE(NULLIF(priority, ''), 'HIGH'),
    due_date = COALESCE(due_date, (now_ts + INTERVAL '3 days')::date);

  -- 8. NOTES COMPLETE FILL
  UPDATE notes SET
    sentiment = COALESCE(NULLIF(sentiment, ''), 'POSITIVE'),
    is_pinned = COALESCE(is_pinned, false),
    is_private = COALESCE(is_private, false);

END $$;
