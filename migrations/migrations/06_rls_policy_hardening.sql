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
              'users',
              'natural_person_profiles',
              'legal_entity_profiles',
              'mfa_methods',
              'roles',
              'user_roles',
              'sessions',
              'ip_restrictions',
              'login_audit_logs',
              'password_history',
              'user_invitations',
              'user_mobile_devices'
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

ALTER TABLE mfa_recovery_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mfa_recovery_codes_isolation ON mfa_recovery_codes;
CREATE POLICY mfa_recovery_codes_isolation ON mfa_recovery_codes AS RESTRICTIVE FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM users u
        WHERE u.id = mfa_recovery_codes.user_id
          AND u.tenant_id = current_setting('app.current_tenant_id', true)::uuid
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM users u
        WHERE u.id = mfa_recovery_codes.user_id
          AND u.tenant_id = current_setting('app.current_tenant_id', true)::uuid
    )
);

ALTER TABLE user_oauth_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_oauth_links_isolation ON user_oauth_links;
CREATE POLICY user_oauth_links_isolation ON user_oauth_links AS RESTRICTIVE FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM users u
        WHERE u.id = user_oauth_links.user_id
          AND u.tenant_id = current_setting('app.current_tenant_id', true)::uuid
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM users u
        WHERE u.id = user_oauth_links.user_id
          AND u.tenant_id = current_setting('app.current_tenant_id', true)::uuid
    )
);
