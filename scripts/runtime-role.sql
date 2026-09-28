BEGIN;

-- SQL-console-compatible grants for the pre-created lmsa_app role.
-- The role credential is provisioned separately and is never stored here.
DO $runtime_grants$
DECLARE
  role_oid oid := to_regrole('lmsa_app');
  table_name text;
  required_tables text[] := ARRAY[
    'user', 'session', 'account', 'verification', 'rateLimit',
    'members', 'events', 'registrations', 'attendance', 'officers',
    'officer_audit', 'app_rate_limits', 'schema_migrations'
  ];
BEGIN
  IF role_oid IS NULL THEN
    RAISE EXCEPTION 'Runtime role lmsa_app does not exist';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_roles
     WHERE oid = role_oid
       AND (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'lmsa_app must not have elevated role attributes or bypass row security';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_roles AS candidate
     WHERE candidate.oid <> role_oid
       AND pg_has_role(role_oid, candidate.oid, 'MEMBER')
  ) THEN
    RAISE EXCEPTION 'lmsa_app is a member of another role; resolve role membership separately';
  END IF;

  -- Normalize direct grants for this role in this database. TEMP inherited
  -- from PUBLIC is intentionally not checked or revoked; it is not persistent DDL.
  EXECUTE format('REVOKE ALL PRIVILEGES ON DATABASE %I FROM lmsa_app', current_database());
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO lmsa_app', current_database());
  REVOKE ALL PRIVILEGES ON SCHEMA public FROM lmsa_app;
  GRANT USAGE ON SCHEMA public TO lmsa_app;
  REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM lmsa_app;

  IF to_regclass('public.schema_migrations') IS NOT NULL THEN
    REVOKE ALL PRIVILEGES ON TABLE public.schema_migrations FROM lmsa_app;
  END IF;

  -- Better Auth: identity, OAuth account, verification, session, and rate-limit lifecycle.
  FOREACH table_name IN ARRAY ARRAY['user', 'session', 'account', 'verification', 'rateLimit'] LOOP
    EXECUTE format(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO lmsa_app',
      table_name
    );
  END LOOP;

  -- Platform: no deletes, truncation, references, or trigger privileges.
  FOREACH table_name IN ARRAY ARRAY['members', 'events', 'registrations'] LOOP
    EXECUTE format(
      'GRANT SELECT, INSERT, UPDATE ON TABLE public.%I TO lmsa_app',
      table_name
    );
  END LOOP;
  GRANT SELECT, INSERT ON TABLE public.attendance TO lmsa_app;
  GRANT SELECT ON TABLE public.officers TO lmsa_app;
  GRANT SELECT, INSERT ON TABLE public.officer_audit TO lmsa_app;
  GRANT SELECT, INSERT, UPDATE ON TABLE public.app_rate_limits TO lmsa_app;

  -- Fail closed: require migrated tables, no ownership/DDL capability, complete
  -- required DML, no excess platform DML, and no access to migration state.
  IF has_database_privilege(role_oid, current_database(), 'CREATE') THEN
    RAISE EXCEPTION 'lmsa_app has database CREATE privilege';
  END IF;
  IF has_schema_privilege(role_oid, 'public', 'CREATE') THEN
    RAISE EXCEPTION 'lmsa_app can create objects in schema public';
  END IF;
  IF (SELECT datdba = role_oid FROM pg_database WHERE datname = current_database()) OR
     (SELECT nspowner = role_oid FROM pg_namespace WHERE nspname = 'public') OR
     EXISTS (SELECT 1 FROM pg_class WHERE relnamespace = 'public'::regnamespace AND relowner = role_oid) OR
     EXISTS (SELECT 1 FROM pg_proc WHERE pronamespace = 'public'::regnamespace AND proowner = role_oid) OR
     EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typowner = role_oid) THEN
    RAISE EXCEPTION 'lmsa_app owns the database, public schema, or an object in public';
  END IF;

  FOREACH table_name IN ARRAY required_tables[1:12] LOOP
    IF to_regclass(format('public.%I', table_name)) IS NULL THEN
      RAISE EXCEPTION 'Required runtime table public.% is missing', table_name;
    END IF;
  END LOOP;
  IF to_regclass('public.schema_migrations') IS NULL THEN
    RAISE EXCEPTION 'public.schema_migrations is missing; apply migrations before runtime grants';
  END IF;
  IF has_any_column_privilege(role_oid, 'public.schema_migrations', 'SELECT') OR
     has_table_privilege(role_oid, 'public.schema_migrations', 'INSERT') OR
     has_table_privilege(role_oid, 'public.schema_migrations', 'UPDATE') OR
     has_table_privilege(role_oid, 'public.schema_migrations', 'DELETE') OR
     has_table_privilege(role_oid, 'public.schema_migrations', 'TRUNCATE') OR
     has_table_privilege(role_oid, 'public.schema_migrations', 'REFERENCES') OR
     has_table_privilege(role_oid, 'public.schema_migrations', 'TRIGGER') THEN
    RAISE EXCEPTION 'lmsa_app has privileges on public.schema_migrations';
  END IF;

  FOREACH table_name IN ARRAY required_tables[1:5] LOOP
    IF NOT has_table_privilege(role_oid, format('public.%I', table_name), 'SELECT') OR
       NOT has_table_privilege(role_oid, format('public.%I', table_name), 'INSERT') OR
       NOT has_table_privilege(role_oid, format('public.%I', table_name), 'UPDATE') OR
       NOT has_table_privilege(role_oid, format('public.%I', table_name), 'DELETE') THEN
      RAISE EXCEPTION 'Better Auth privileges on public.% are incomplete', table_name;
    END IF;
  END LOOP;
  IF NOT has_table_privilege(role_oid, 'public.members', 'SELECT') OR
     NOT has_table_privilege(role_oid, 'public.members', 'INSERT') OR
     NOT has_table_privilege(role_oid, 'public.members', 'UPDATE') OR
     NOT has_table_privilege(role_oid, 'public.events', 'SELECT') OR
     NOT has_table_privilege(role_oid, 'public.events', 'INSERT') OR
     NOT has_table_privilege(role_oid, 'public.events', 'UPDATE') OR
     NOT has_table_privilege(role_oid, 'public.registrations', 'SELECT') OR
     NOT has_table_privilege(role_oid, 'public.registrations', 'INSERT') OR
     NOT has_table_privilege(role_oid, 'public.registrations', 'UPDATE') OR
     NOT has_table_privilege(role_oid, 'public.attendance', 'SELECT') OR
     NOT has_table_privilege(role_oid, 'public.attendance', 'INSERT') OR
     NOT has_table_privilege(role_oid, 'public.officers', 'SELECT') OR
     NOT has_table_privilege(role_oid, 'public.officer_audit', 'SELECT') OR
     NOT has_table_privilege(role_oid, 'public.officer_audit', 'INSERT') OR
     NOT has_table_privilege(role_oid, 'public.app_rate_limits', 'SELECT') OR
     NOT has_table_privilege(role_oid, 'public.app_rate_limits', 'INSERT') OR
     NOT has_table_privilege(role_oid, 'public.app_rate_limits', 'UPDATE') THEN
    RAISE EXCEPTION 'Required platform table privileges are incomplete';
  END IF;
  FOREACH table_name IN ARRAY required_tables[1:12] LOOP
    IF has_table_privilege(role_oid, format('public.%I', table_name), 'TRUNCATE') OR
       has_table_privilege(role_oid, format('public.%I', table_name), 'REFERENCES') OR
       has_table_privilege(role_oid, format('public.%I', table_name), 'TRIGGER') THEN
      RAISE EXCEPTION 'lmsa_app has excess privileges on public.%', table_name;
    END IF;
  END LOOP;
  IF has_table_privilege(role_oid, 'public.members', 'DELETE') OR
     has_table_privilege(role_oid, 'public.events', 'DELETE') OR
     has_table_privilege(role_oid, 'public.registrations', 'DELETE') OR
     has_table_privilege(role_oid, 'public.attendance', 'DELETE') OR
     has_table_privilege(role_oid, 'public.officers', 'INSERT') OR
     has_table_privilege(role_oid, 'public.officers', 'UPDATE') OR
     has_table_privilege(role_oid, 'public.officers', 'DELETE') OR
     has_table_privilege(role_oid, 'public.officer_audit', 'UPDATE') OR
     has_table_privilege(role_oid, 'public.officer_audit', 'DELETE') OR
     has_table_privilege(role_oid, 'public.app_rate_limits', 'DELETE') THEN
    RAISE EXCEPTION 'lmsa_app has excess platform DML privileges';
  END IF;
END
$runtime_grants$;

COMMIT;
