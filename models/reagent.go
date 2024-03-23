package models

import (
	"database/sql"
	"fmt"
	"log"
)

type Reagent struct {
	Id              int
	Name            sql.NullString
	MolecularWeight float64
	Density         sql.NullFloat64
	Mol             sql.NullString
}

const SVG_HEADER = "<?xml version='1.0' encoding='iso-8859-1'?>"
const SVG_HEADER_LEN = len(SVG_HEADER)

func GetSimilarReagents(db *sql.DB, reagentName string) ([]Reagent, error) {
	stmt := fmt.Sprintf("%s%%", reagentName)

	rows, err := db.Query(`
    SELECT id, 
          name,
          molecular_weight,
          density,
          mol_to_svg(mol,'', 100, 100, '{"clearBackground": 0}')
    FROM reagent
    WHERE LOWER(name) LIKE LOWER($1);
    `, stmt)

	defer rows.Close()
	if err != nil {
		log.Fatal(err)
	}

	result := []Reagent{}
	for rows.Next() {
		r := &Reagent{}
		err := rows.Scan(&r.Id, &r.Name, &r.MolecularWeight, &r.Density, &r.Mol)
		if err != nil {
			log.Fatal(err)
		}
		result = append(result, *r)
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}
	return result, err
}

// returns *Reagent and the mol svg
func GetReagentById(db *sql.DB, id int) (*Reagent, string) {
	row := db.QueryRow(`
    SELECT id, 
          name, 
          molecular_weight,
          density, 
          mol_to_svg(r.mol,'', 100, 100, '{"clearBackground": 0}')
    FROM reagent r
    WHERE id=$1`, id)
	r := &Reagent{}
	var molSVG string
	err := row.Scan(&r.Id, &r.Name, &r.MolecularWeight, &r.Density, &molSVG)
	if err != nil {
		log.Fatalf("Error getting reagent by id: %s", err)
	}
	// molSVG = molSVG[SVG_HEADER_LEN:]
	return r, molSVG
}

func AssignReagentToExperiment(db *sql.DB, reagentId int, experimentId int) {
	_, err := db.Exec(`
    INSERT INTO experiment_reagent_association era
    (exp_id, reagent_id, reaction_scheme_location, equivalents, limiting_reagent, amount_planned_in_grams, amount_planned_unit)
    VALUES
    ($1, $2,)
    `, experimentId, reagentId)

	if err != nil {
		log.Fatal(err)
	}
}
