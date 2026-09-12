import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { buildOwnerBackfill } from '../supabase/operations/build-owner-backfill.mjs';

const url = process.env.ACCOUNT_TEST_DATABASE_URL;
assert.ok(url, 'Set ACCOUNT_TEST_DATABASE_URL to an empty local habit_account_* database.');
const parsed = new URL(url);
assert.ok(
  ['localhost', '127.0.0.1'].includes(parsed.hostname) &&
    parsed.pathname.startsWith('/habit_account_'),
);
function sql(source, failure) {
  const result = spawnSync('psql', [url, '-X', '-v', 'ON_ERROR_STOP=1', '-At'], {
    input: source,
    encoding: 'utf8',
  });
  if (failure) {
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, failure);
  } else assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
assert.equal(sql("SELECT count(*) FROM pg_tables WHERE schemaname = 'public';"), '0');
const pushMode = process.env.ACCOUNT_TEST_DB_PUSH === '1';
const owner = pushMode
  ? 'f4b7da9e-8a5a-4ee3-9abb-526a26a8d464'
  : '11111111-1111-4111-8111-111111111111';
const backupSchema = pushMode ? 'account_ownership_backup_20260912' : 'account_backup_test';
const baseline = readdirSync('supabase/migrations')
  .sort()
  .filter((name) => name < '20260912000000_account_ownership.sql')
  .map((name) => readFileSync(`supabase/migrations/${name}`, 'utf8'))
  .join('\n');
sql(
  readFileSync('supabase/tests/bootstrap.sql', 'utf8') +
    '\n' +
    baseline +
    `
INSERT INTO auth.users(id,email) VALUES ('${owner}','owner@example.test');
INSERT INTO public.user_profiles(id,name,gym_settings) VALUES ('default_user','Preserved name','{"weight": 67.2}');
INSERT INTO public.habits(id,name,history) VALUES ('preserved-habit','Preserved habit','{"2026-09-12":{"completed":true,"notes":"Keep this note"}}');
INSERT INTO public.gym_body_metrics(logged_at,weight_kg,notes) VALUES ('2026-09-12',67.2,'Keep these measurements');
-- Shape of the additional table observed in the hosted OpenAPI schema; synthetic values only.
CREATE TABLE public.workout_exercises (
 id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, name TEXT NOT NULL UNIQUE,
 category TEXT NOT NULL DEFAULT 'Other', image_url TEXT, default_sets INTEGER DEFAULT 4,
 default_reps TEXT DEFAULT '8-12', is_custom BOOLEAN DEFAULT false,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX workout_exercises_name_index ON public.workout_exercises(name);
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY legacy_public ON public.workout_exercises FOR ALL USING (true) WITH CHECK (true);
INSERT INTO public.workout_exercises(id,name,default_sets) VALUES ('preserved-exercise','Preserved exercise',5);
INSERT INTO storage.objects(bucket_id,name) VALUES ('media_store','store/keep.jpg');
`,
);
const rollout = buildOwnerBackfill(owner, 'account_backup_test');
const balances = sql(
  'SELECT jsonb_agg(to_jsonb(t) ORDER BY currency) FROM public.current_budget t;',
);
sql(
  rollout.replace(
    '-- Verify every original value',
    'UPDATE public.current_budget SET balance = 0;\n-- Verify every original value',
  ),
  /Original values changed/,
);
assert.equal(
  sql('SELECT jsonb_agg(to_jsonb(t) ORDER BY currency) FROM public.current_budget t;'),
  balances,
);
assert.equal(sql("SELECT count(*) FROM pg_namespace WHERE nspname='account_backup_test';"), '0');
assert.equal(
  sql(
    "SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='habits' AND column_name='user_id';",
  ),
  '0',
);
console.log(
  'PASS: accidental data edits abort and roll back both migration and backup transaction',
);
if (pushMode) {
  const ownership = readFileSync(
    'supabase/migrations/20260912000000_account_ownership.sql',
    'utf8',
  );
  const exercises = readFileSync(
    'supabase/migrations/20260912000001_account_workout_exercises.sql',
    'utf8',
  );
  sql(
    `BEGIN; INSERT INTO auth.users(id,email) VALUES ('33333333-3333-4333-8333-333333333333','new@example.test');\n${ownership}\nCOMMIT;`,
    /verified sole account no longer matches/,
  );
  sql(
    ownership.replace(
      '-- Verify every original public value',
      'UPDATE public.current_budget SET balance = 0;\n-- Verify every original public value',
    ),
    /Original values changed/,
  );
  assert.equal(
    sql("SELECT count(*) FROM pg_namespace WHERE nspname='account_ownership_backup_20260912';"),
    '0',
  );
  assert.equal(
    sql('SELECT jsonb_agg(to_jsonb(t) ORDER BY currency) FROM public.current_budget t;'),
    balances,
  );
  // No owner setting: each migration gets a new connection, as CLI invocations may do.
  sql(`BEGIN;\n${ownership}\nCOMMIT;`);
  sql(
    exercises.replace(
      '  SELECT EXISTS (',
      '  UPDATE public.workout_exercises SET default_sets = 99;\n  SELECT EXISTS (',
    ),
    /Original values changed/,
  );
  assert.equal(
    sql("SELECT default_sets FROM public.workout_exercises WHERE id='preserved-exercise';"),
    '5',
  );
  sql(`BEGIN;\n${exercises}\nCOMMIT;`);
  console.log(
    'PASS: unconfigured push uses only the verified sole owner; changed audit refuses; both migrations detect value changes and roll back',
  );
} else sql(rollout);
assert.equal(
  sql(
    `SELECT count(*) FROM ${backupSchema}._record_counts WHERE rows_before IS DISTINCT FROM rows_after;`,
  ),
  '0',
);
assert.equal(
  sql("SELECT user_id FROM public.workout_exercises WHERE id='preserved-exercise';"),
  owner,
);
assert.equal(sql('SELECT notes FROM public.gym_body_metrics;'), 'Keep these measurements');
assert.equal(sql("SELECT owner_id FROM storage.objects WHERE name='store/keep.jpg';"), owner);
sql(`BEGIN; SET LOCAL ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${owner}',true);
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.workout_exercises WHERE name='Preserved exercise' AND default_sets=5) THEN RAISE EXCEPTION 'Own exercise missing'; END IF;
 IF has_schema_privilege(current_user, '${backupSchema}', 'USAGE') THEN RAISE EXCEPTION 'Backup exposed'; END IF;
END $$; ROLLBACK;`);
sql(`INSERT INTO auth.users(id,email) VALUES ('22222222-2222-4222-8222-222222222222','other@example.test');
BEGIN; SET LOCAL ROLE authenticated; SELECT set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
DO $$ BEGIN IF EXISTS (SELECT 1 FROM public.workout_exercises) THEN RAISE EXCEPTION 'Cross-owner exercise visible'; END IF; END $$;
INSERT INTO public.workout_exercises(name) VALUES ('Preserved exercise'); ROLLBACK;`);
console.log(
  'PASS: all original values and row counts preserved; verified owner assigned; backup private; exercise names isolated',
);
