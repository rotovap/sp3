CREATE TABLE IF NOT EXISTS experiment (
  id serial PRIMARY KEY,
  name text UNIQUE
);
