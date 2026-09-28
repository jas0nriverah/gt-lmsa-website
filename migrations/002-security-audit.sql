ALTER TABLE events
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1 CHECK (version > 0);

CREATE TABLE IF NOT EXISTS officer_audit (
  id uuid PRIMARY KEY,
  actor_user_id text NOT NULL,
  action text NOT NULL CHECK (action IN (
    'event.created',
    'event.updated',
    'member.status_changed',
    'attendance.recorded',
    'attendance.exported'
  )),
  target_id text NOT NULL,
  request_id uuid NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(details) = 'object'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS officer_audit_created_at_idx
  ON officer_audit (created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS officer_audit_action_created_at_idx
  ON officer_audit (action, created_at DESC, id DESC);
