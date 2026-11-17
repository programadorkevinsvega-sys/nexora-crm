-- ==============================================================================
-- TENANT EXTENSIONS SEED SCRIPT: BRANCHES, TAXES, CURRENCIES
-- ==============================================================================

DO $$
DECLARE
  tid UUID := '00000000-0000-0000-0000-000000000001';
  now_ts TIMESTAMPTZ := NOW();
  c_usd_id UUID := '10000000-0000-0000-0000-000000000001';
  c_cop_id UUID := '10000000-0000-0000-0000-000000000002';
  c_mxn_id UUID := '10000000-0000-0000-0000-000000000003';
  c_eur_id UUID := '10000000-0000-0000-0000-000000000004';
  c_brl_id UUID := '10000000-0000-0000-0000-000000000005';
BEGIN

  -- 1. SUCURSALES Y SEDES (BRANCHES)
  DELETE FROM tenants.branches WHERE tenant_id = tid;

  INSERT INTO tenants.branches (id, tenant_id, name, code, address, city, country, is_active, is_headquarters, created_at, updated_at)
  VALUES
    (gen_random_uuid(), tid, 'Sede Principal — Bogotá HQ', 'BOG-HQ', 'Cra 7 # 71-21 Torre A, Piso 12', 'Bogotá', 'Colombia', true, true, now_ts, now_ts),
    (gen_random_uuid(), tid, 'Hub de Innovación — Medellín', 'MDE-01', 'Calle 10 # 32-115, El Poblado', 'Medellín', 'Colombia', true, false, now_ts, now_ts),
    (gen_random_uuid(), tid, 'Sede Cono Sur — Buenos Aires', 'BUE-01', 'Av. Caseros 3039, Parque Patricios', 'Buenos Aires', 'Argentina', true, false, now_ts, now_ts),
    (gen_random_uuid(), tid, 'Hub Brasil — São Paulo', 'SAO-01', 'Rua Capote Valente 39, Pinheiros', 'São Paulo', 'Brasil', true, false, now_ts, now_ts),
    (gen_random_uuid(), tid, 'Sede Norte — Ciudad de México', 'CDMX-01', 'Paseo de la Reforma 222', 'Ciudad de México', 'México', true, false, now_ts, now_ts);

  -- 2. IMPUESTOS Y RETENCIONES POR EMPRESA
  DELETE FROM tenants.tenant_tax_configurations WHERE tenant_id = tid;

  INSERT INTO tenants.tenant_tax_configurations (id, tenant_id, tax_name, tax_percentage, tax_type, description, is_active, created_at, updated_at)
  VALUES
    (gen_random_uuid(), tid, 'IVA General (Colombia)', 19.00, 'SALES', 'Impuesto al Valor Agregado estándar para servicios SaaS en Colombia.', true, now_ts, now_ts),
    (gen_random_uuid(), tid, 'IVA México', 16.00, 'SALES', 'Impuesto al Valor Agregado para operaciones comerciales en México.', true, now_ts, now_ts),
    (gen_random_uuid(), tid, 'IVA Argentina', 21.00, 'SALES', 'Impuesto al Valor Agregado estándar en Argentina.', true, now_ts, now_ts),
    (gen_random_uuid(), tid, 'Retención en la Fuente (Servicios)', 2.50, 'WITHHOLDING', 'Retención preventiva para contratos comerciales B2B.', true, now_ts, now_ts),
    (gen_random_uuid(), tid, 'ReteICA Bogotá', 0.96, 'WITHHOLDING', 'Retención de Industria y Comercio para actividades de software.', true, now_ts, now_ts);

  -- 3. MONEDAS (CURRENCIES)
  DELETE FROM tenants.tenant_currencies WHERE tenant_id = tid;

  INSERT INTO tenants.tenant_currencies (id, tenant_id, iso_code, name, symbol, is_base_currency, is_active, created_at, updated_at)
  VALUES
    (c_usd_id, tid, 'USD', 'Dólar Estadounidense', '$', true, true, now_ts, now_ts),
    (c_cop_id, tid, 'COP', 'Peso Colombiano', '$', false, true, now_ts, now_ts),
    (c_mxn_id, tid, 'MXN', 'Peso Mexicano', '$', false, true, now_ts, now_ts),
    (c_eur_id, tid, 'EUR', 'Euro', '€', false, true, now_ts, now_ts),
    (c_brl_id, tid, 'BRL', 'Real Brasileño', 'R$', false, true, now_ts, now_ts);

  -- 4. TASAS DE CAMBIO (EXCHANGE RATES)
  DELETE FROM tenants.tenant_exchange_rates WHERE tenant_id = tid;

  INSERT INTO tenants.tenant_exchange_rates (id, tenant_id, from_currency_id, to_currency_id, rate, effective_date, created_at)
  VALUES
    (gen_random_uuid(), tid, c_usd_id, c_cop_id, 4150.000000, now_ts, now_ts),
    (gen_random_uuid(), tid, c_usd_id, c_mxn_id, 18.500000, now_ts, now_ts),
    (gen_random_uuid(), tid, c_usd_id, c_eur_id, 0.920000, now_ts, now_ts),
    (gen_random_uuid(), tid, c_usd_id, c_brl_id, 5.400000, now_ts, now_ts);

END $$;
