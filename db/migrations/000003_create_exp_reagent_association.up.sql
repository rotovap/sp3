CREATE TYPE reaction_scheme_location_enum AS ENUM (
  'LEFT_SIDE',
  'ABOVE_ARROW',
  'BELOW_ARROW',
  'RIGHT_SIDE');

CREATE TYPE reagent_unit AS ENUM (
  'G',
  'MG',
  'ML',
  'L'
);

CREATE TABLE IF NOT EXISTS experiment_reagent_association (
  id serial PRIMARY KEY, 
  exp_id serial REFERENCES experiment(id) NOT NULL,
  reagent_id serial REFERENCES reagent(id) NOT NULL,
  reaction_scheme_location reaction_scheme_location_enum,
  equivalents real,
  limiting_reagent boolean,
  amount_planned_in_grams real,
  amount_planned_unit reagent_unit
);

