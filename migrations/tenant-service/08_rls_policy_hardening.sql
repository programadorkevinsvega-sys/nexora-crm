DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'tenant_id'
          AND table_name IN (
              'branches',
              'tenant_branding',
              'tenant_features',
              'tenant_usage_metrics',
              'tenant_domains',
              'installed_modules',
              'tenant_tax_configurations',
              'tenant_languages',
              'tenant_translations',
              'tenant_currencies',
              'tenant_exchange_rates',
              'tenant_api_keys',
              'tenant_webhooks',
              'tenant_webhook_delivery_logs',
              'tenant_system_audit_logs',
              'tenant_saas_snapshot'
          )
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I;', t);
        EXECUTE format(
            'CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid) WITH CHECK (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);',
            t
        );
    END LOOP;
END $$;

ALTER TABLE tenant_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_webhook_events_isolation ON tenant_webhook_events;
CREATE POLICY tenant_webhook_events_isolation ON tenant_webhook_events AS RESTRICTIVE FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM tenant_webhooks tw
        WHERE tw.id = tenant_webhook_events.webhook_id
          AND tw.tenant_id = current_setting('app.current_tenant_id', true)::uuid
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM tenant_webhooks tw
        WHERE tw.id = tenant_webhook_events.webhook_id
          AND tw.tenant_id = current_setting('app.current_tenant_id', true)::uuid
    )
);
