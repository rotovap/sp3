CREATE EXTENSION IF NOT EXISTS rdkit;

CREATE TABLE IF NOT EXISTS reagent (
  id serial PRIMARY KEY,
  name text UNIQUE,
  molecular_weight REAL NOT NULL,
  density REAL
);

-- seems that the mol type column cannot be added in the create table statement
ALTER TABLE reagent ADD mol mol UNIQUE;
CREATE INDEX molidx ON reagent USING gist(mol);
