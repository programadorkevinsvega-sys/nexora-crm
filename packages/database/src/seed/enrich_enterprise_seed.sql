-- ==============================================================================
-- SCRIPT: enrich_enterprise_seed.sql
-- PURPOSE: Populate rich enterprise seed data for Companies, Contacts, Deals, Tickets
-- ==============================================================================

-- 1. ENRICH COMPANIES
UPDATE "companies" SET
  "phone" = '+57 601 3110001',
  "email" = 'contacto@stripe.com',
  "country" = 'Colombia',
  "city" = 'Bogotá',
  "address" = 'Cra 7 # 71-21 Torre A, Piso 12',
  "tier" = 'TIER_1_VIP',
  "lifecycle_stage" = 'CUSTOMER',
  "health_score" = 98,
  "annual_revenue" = 12500000.00,
  "linkedin_url" = 'https://linkedin.com/company/stripe'
WHERE "name" ILIKE '%Stripe%';

UPDATE "companies" SET
  "phone" = '+54 11 40001111',
  "email" = 'enterprise@mercadolibre.com',
  "country" = 'Argentina',
  "city" = 'Buenos Aires',
  "address" = 'Av. Caseros 3039, Parque Patricios',
  "tier" = 'TIER_1_VIP',
  "lifecycle_stage" = 'PROSPECT',
  "health_score" = 87,
  "annual_revenue" = 85000000.00,
  "linkedin_url" = 'https://linkedin.com/company/mercadolibre'
WHERE "name" ILIKE '%MercadoLibre%';

UPDATE "companies" SET
  "phone" = '+55 11 50002222',
  "email" = 'corporate@nubank.com',
  "country" = 'Brasil',
  "city" = 'São Paulo',
  "address" = 'Rua Capote Valente 39, Pinheiros',
  "tier" = 'TIER_1_VIP',
  "lifecycle_stage" = 'CUSTOMER',
  "health_score" = 95,
  "annual_revenue" = 45000000.00,
  "linkedin_url" = 'https://linkedin.com/company/nubank'
WHERE "name" ILIKE '%Nubank%';

UPDATE "companies" SET
  "phone" = '+57 601 7000333',
  "email" = 'partners@rappi.com',
  "country" = 'Colombia',
  "city" = 'Bogotá',
  "address" = 'Calle 93B # 19-36',
  "tier" = 'TIER_2',
  "lifecycle_stage" = 'LEAD',
  "health_score" = 78,
  "annual_revenue" = 28000000.00,
  "linkedin_url" = 'https://linkedin.com/company/rappi'
WHERE "name" ILIKE '%Rappi%';

UPDATE "companies" SET
  "phone" = '+1 415 5550199',
  "email" = 'sales@cloudscale.io',
  "country" = 'Estados Unidos',
  "city" = 'San Francisco',
  "address" = '500 Howard St, Suite 400',
  "tier" = 'TIER_2',
  "lifecycle_stage" = 'PARTNER',
  "health_score" = 91,
  "annual_revenue" = 8500000.00,
  "linkedin_url" = 'https://linkedin.com/company/cloudscale'
WHERE "name" ILIKE '%CloudScale%';

UPDATE "companies" SET
  "phone" = '+52 55 88883322',
  "email" = 'info@biohealth.org',
  "country" = 'México',
  "city" = 'Ciudad de México',
  "address" = 'Paseo de la Reforma 222',
  "tier" = 'TIER_3',
  "lifecycle_stage" = 'PROSPECT',
  "health_score" = 74,
  "annual_revenue" = 19000000.00,
  "linkedin_url" = 'https://linkedin.com/company/biohealth'
WHERE "name" ILIKE '%BioHealth%';

-- 2. ENRICH CONTACTS
UPDATE "contacts" SET
  "whatsapp_number" = '+573001112233',
  "lead_score" = 95,
  "preferred_language" = 'ES',
  "timezone" = 'America/Bogota',
  "city" = 'Bogotá',
  "country" = 'Colombia',
  "linkedin_url" = 'https://linkedin.com/in/carlos-mendoza-stripe'
WHERE "first_name" ILIKE '%Carlos%' AND "last_name" ILIKE '%Mendoza%';

UPDATE "contacts" SET
  "whatsapp_number" = '+573204445566',
  "lead_score" = 92,
  "preferred_language" = 'ES',
  "timezone" = 'America/Bogota',
  "city" = 'Bogotá',
  "country" = 'Colombia',
  "linkedin_url" = 'https://linkedin.com/in/mateo-gomez-tech'
WHERE "first_name" ILIKE '%Mateo%' AND "last_name" ILIKE '%Gomez%';

UPDATE "contacts" SET
  "whatsapp_number" = '+573118889900',
  "lead_score" = 89,
  "preferred_language" = 'ES',
  "timezone" = 'America/Bogota',
  "city" = 'Bogotá',
  "country" = 'Colombia',
  "linkedin_url" = 'https://linkedin.com/in/mariana-torres-sales'
WHERE "first_name" ILIKE '%Mariana%' AND "last_name" ILIKE '%Torres%';

UPDATE "contacts" SET
  "whatsapp_number" = '+549115554422',
  "lead_score" = 86,
  "preferred_language" = 'ES',
  "timezone" = 'America/Argentina/Buenos_Aires',
  "city" = 'Buenos Aires',
  "country" = 'Argentina',
  "linkedin_url" = 'https://linkedin.com/in/valentina-rios-cto'
WHERE "first_name" ILIKE '%Valentina%' AND "last_name" ILIKE '%Rios%';

UPDATE "contacts" SET
  "whatsapp_number" = '+551198887766',
  "lead_score" = 91,
  "preferred_language" = 'PT',
  "timezone" = 'America/Sao_Paulo',
  "city" = 'São Paulo',
  "country" = 'Brasil',
  "linkedin_url" = 'https://linkedin.com/in/david-silva-nubank'
WHERE "first_name" ILIKE '%David%' AND "last_name" ILIKE '%Silva%';

UPDATE "contacts" SET
  "whatsapp_number" = '+573109998877',
  "lead_score" = 80,
  "preferred_language" = 'ES',
  "timezone" = 'America/Bogota',
  "city" = 'Bogotá',
  "country" = 'Colombia',
  "linkedin_url" = 'https://linkedin.com/in/camila-ortega-rappi'
WHERE "first_name" ILIKE '%Camila%' AND "last_name" ILIKE '%Ortega%';

UPDATE "contacts" SET
  "whatsapp_number" = '+14155550199',
  "lead_score" = 68,
  "preferred_language" = 'EN',
  "timezone" = 'America/Los_Angeles',
  "city" = 'San Francisco',
  "country" = 'Estados Unidos',
  "linkedin_url" = 'https://linkedin.com/in/alejandro-morales-cloud'
WHERE "first_name" ILIKE '%Alejandro%' AND "last_name" ILIKE '%Morales%';

UPDATE "contacts" SET
  "whatsapp_number" = '+525588883322',
  "lead_score" = 75,
  "preferred_language" = 'ES',
  "timezone" = 'America/Mexico_City',
  "city" = 'Ciudad de México',
  "country" = 'México',
  "linkedin_url" = 'https://linkedin.com/in/lucia-fernandez-pharma'
WHERE "first_name" ILIKE '%Lucía%' OR ("first_name" ILIKE '%Lucia%' AND "last_name" ILIKE '%Fernandez%');

-- 3. ENRICH DEALS
UPDATE "deals" SET
  "currency" = 'USD',
  "forecast_category" = 'CLOSED'
WHERE "status" = 'WON';

UPDATE "deals" SET
  "currency" = 'USD',
  "forecast_category" = 'COMMIT'
WHERE "status" = 'OPEN' AND "amount" >= 100000;

UPDATE "deals" SET
  "currency" = 'USD',
  "forecast_category" = 'BEST_CASE'
WHERE "status" = 'OPEN' AND "amount" < 100000 AND "amount" >= 40000;

UPDATE "deals" SET
  "currency" = 'USD',
  "forecast_category" = 'PIPELINE'
WHERE "status" = 'OPEN' AND "amount" < 40000;
