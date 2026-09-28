CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY,
  user_id text NOT NULL UNIQUE REFERENCES "user" (id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  email text NOT NULL UNIQUE CHECK (email = lower(btrim(email))),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended')),
  academic_year text NOT NULL DEFAULT '',
  major text NOT NULL DEFAULT '',
  interests text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS members_status_created_at_idx
  ON members (status, created_at DESC);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY,
  title text NOT NULL CHECK (length(btrim(title)) > 0),
  description text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (length(btrim(category)) > 0),
  timing_label text NOT NULL DEFAULT '',
  starts_at timestamptz,
  ends_at timestamptz,
  publication_status text NOT NULL DEFAULT 'draft'
    CHECK (publication_status IN ('draft', 'published', 'cancelled')),
  registration_status text NOT NULL DEFAULT 'closed'
    CHECK (registration_status IN ('open', 'closed')),
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  capacity integer CHECK (capacity IS NULL OR capacity > 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT events_time_window_check
    CHECK (
      (starts_at IS NULL) = (ends_at IS NULL)
      AND (ends_at IS NULL OR ends_at > starts_at)
    ),
  CONSTRAINT events_registration_window_check
    CHECK (
      registration_opens_at IS NULL
      OR registration_closes_at IS NULL
      OR registration_closes_at > registration_opens_at
    ),
  CONSTRAINT events_open_registration_check
    CHECK (
      registration_status <> 'open'
      OR (publication_status = 'published' AND starts_at IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS events_public_timing_idx
  ON events (publication_status, starts_at, ends_at);

CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'registered'
    CHECK (status IN ('registered', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  ticket_token_hash text,
  ticket_expires_at timestamptz,
  CONSTRAINT registrations_member_event_unique UNIQUE (member_id, event_id),
  CONSTRAINT registrations_ticket_pair_check
    CHECK ((ticket_token_hash IS NULL) = (ticket_expires_at IS NULL)),
  CONSTRAINT registrations_ticket_hash_check
    CHECK (ticket_token_hash IS NULL OR ticket_token_hash ~ '^[0-9a-f]{64}$')
);

CREATE INDEX IF NOT EXISTS registrations_event_status_created_idx
  ON registrations (event_id, status, created_at);
CREATE INDEX IF NOT EXISTS registrations_member_created_idx
  ON registrations (member_id, created_at DESC);

CREATE TABLE IF NOT EXISTS attendance (
  registration_id uuid PRIMARY KEY REFERENCES registrations (id) ON DELETE CASCADE,
  officer_user_id text NOT NULL REFERENCES "user" (id) ON DELETE RESTRICT,
  checked_in_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS attendance_checked_in_at_idx
  ON attendance (checked_in_at DESC);

CREATE TABLE IF NOT EXISTS officers (
  user_id text PRIMARY KEY REFERENCES "user" (id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS app_rate_limits (
  bucket_key text PRIMARY KEY,
  count integer NOT NULL CHECK (count >= 0),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS app_rate_limits_expires_at_idx
  ON app_rate_limits (expires_at);

INSERT INTO events (
  id,
  title,
  description,
  location,
  category,
  timing_label,
  starts_at,
  ends_at,
  publication_status,
  registration_status,
  registration_opens_at,
  registration_closes_at,
  capacity
) VALUES (
  'b978ce11-0e75-4e1d-91cb-5fb6fd327001',
  'Fall 2026 Interest Meeting',
  'Meet the founding executive board, learn what LMSA PLUS is, explore planned programming, and share what would make the chapter useful to you.',
  'Details to be announced',
  'Chapter launch',
  'Date TBD — the second or third week of October 2026',
  NULL,
  NULL,
  'published',
  'closed',
  NULL,
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO events (
  id,
  title,
  description,
  location,
  category,
  timing_label,
  starts_at,
  ends_at,
  publication_status,
  registration_status,
  registration_opens_at,
  registration_closes_at,
  capacity
) VALUES (
  'b978ce11-0e75-4e1d-91cb-5fb6fd327002',
  'First General Body Meeting',
  'A planned first meeting for members to connect, learn about the chapter, and find ways to participate.',
  'Details to be announced',
  'Chapter meeting',
  'Fall 2026 — date to be confirmed',
  NULL,
  NULL,
  'published',
  'closed',
  NULL,
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;
