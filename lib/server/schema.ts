export const schemaSql = `
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_reference text NOT NULL UNIQUE CHECK (char_length(identity_reference) BETWEEN 1 AND 255),
  display_name text NOT NULL CHECK (
    display_name = btrim(display_name) AND char_length(display_name) BETWEEN 1 AND 80
  ),
  timezone text NOT NULL DEFAULT 'UTC' CHECK (char_length(timezone) BETWEEN 1 AND 64),
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT date_trunc('milliseconds', now()),
  updated_at timestamptz NOT NULL DEFAULT date_trunc('milliseconds', now())
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (title = btrim(title) AND char_length(title) BETWEEN 1 AND 120),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 5000),
  target_date date,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT date_trunc('milliseconds', now()),
  updated_at timestamptz NOT NULL DEFAULT date_trunc('milliseconds', now())
);

CREATE INDEX IF NOT EXISTS goals_owner_created_idx ON goals (owner_id, created_at, id);

CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES goals (id) ON DELETE CASCADE,
  title text NOT NULL CHECK (title = btrim(title) AND char_length(title) BETWEEN 1 AND 120),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 5000),
  deadline date,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT date_trunc('milliseconds', now()),
  updated_at timestamptz NOT NULL DEFAULT date_trunc('milliseconds', now()),
  UNIQUE (goal_id, id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES goals (id) ON DELETE CASCADE,
  milestone_id uuid,
  title text NOT NULL CHECK (title = btrim(title) AND char_length(title) BETWEEN 1 AND 120),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 5000),
  deadline date,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT date_trunc('milliseconds', now()),
  updated_at timestamptz NOT NULL DEFAULT date_trunc('milliseconds', now()),
  CHECK ((completed AND completed_at IS NOT NULL) OR (NOT completed AND completed_at IS NULL)),
  FOREIGN KEY (goal_id, milestone_id) REFERENCES milestones (goal_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS milestones_goal_idx ON milestones (goal_id, id);
CREATE INDEX IF NOT EXISTS tasks_goal_idx ON tasks (goal_id, id);
CREATE INDEX IF NOT EXISTS tasks_goal_milestone_idx ON tasks (goal_id, milestone_id);

CREATE OR REPLACE FUNCTION prevent_parent_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF to_jsonb(NEW) ->> TG_ARGV[0] IS DISTINCT FROM to_jsonb(OLD) ->> TG_ARGV[0] THEN
    RAISE EXCEPTION '% cannot be changed', TG_ARGV[0] USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER goals_owner_immutable
  BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION prevent_parent_change('owner_id');

CREATE OR REPLACE TRIGGER milestones_goal_immutable
  BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION prevent_parent_change('goal_id');

CREATE OR REPLACE TRIGGER tasks_goal_immutable
  BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION prevent_parent_change('goal_id');
`;
