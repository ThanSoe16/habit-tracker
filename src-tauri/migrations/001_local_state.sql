-- A snapshot and its confirmed cloud baseline are committed in one SQLite write.
CREATE TABLE local_state (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL CHECK (json_valid(value))
);
