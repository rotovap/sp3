package models

import "database/sql"

type Reagent struct {
	Id              int
	Name            sql.NullString
	MolecularWeight float64
	Density         sql.NullFloat64
}
