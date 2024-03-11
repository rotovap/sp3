CREATE TABLE IF NOT EXISTS experiments (
  id serial PRIMARY KEY,
  name text UNIQUE
);
