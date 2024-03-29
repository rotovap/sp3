package models

import (
	"database/sql"
	"fmt"
	"log"
)

type ExperimentReagentAssociation struct {
	ReactionSchemeLocation, AmountPlannedUnit sql.NullString
	Equivalents, AmountPlannedInGrams         sql.NullFloat64
	LimitingReagent                           sql.NullBool
	MolSvg                                    string
}

type Experiment struct {
	Id   int
	Name string
}

type GetReagentsInExperimentResult struct {
	Experiment  Experiment
	Reagent     Reagent
	Association ExperimentReagentAssociation
}

func GetReagentsInExperiment(db *sql.DB, experimentId int) ([]GetReagentsInExperimentResult, error) {
	// following example from:
	// https://www.calhoun.io/querying-for-a-single-record-using-gos-database-sql-package/
	rows, err := db.Query(`
          SELECT e.name,
                era.reaction_scheme_location,
                era.amount_planned_unit,
                era.reagent_id,
                era.equivalents,
                era.limiting_reagent,
                era.amount_planned_in_grams,
                r.name AS reagent_name,
                r.molecular_weight,
                r.density,
                r.mol
          FROM experiment e
          INNER JOIN experiment_reagent_association era
          ON era.exp_id=e.id
          INNER JOIN reagent r 
          ON r.id=era.reagent_id
          WHERE e.id=$1
    `, experimentId)
	defer rows.Close()

	var result []GetReagentsInExperimentResult
	var mol sql.NullString

	for rows.Next() {
		// store the scan result into an association struct
		// then append this to the result
		e := &ExperimentReagentAssociation{}
		expt := &Experiment{}
		reagent := &Reagent{}
		err = rows.Scan(&expt.Name,
			&e.ReactionSchemeLocation,
			&e.AmountPlannedUnit,
			&reagent.Id,
			&e.Equivalents,
			&e.LimitingReagent,
			&e.AmountPlannedInGrams,
			&reagent.Name,
			&reagent.MolecularWeight,
			&reagent.Density,
			&mol)
		if err != nil {
			panic(err)
		}

		// want to put the reagent id as the legend, but
		// could not get quote_literal(id) into the mol_to_svg function as part of the above query,
		// so use string format to get the id in as a quote literal for the legend
		// then use a query param to get the mol in, which was queried above

		// -- clearBackground: 0 will make a transparent background, but the bonds are black so on black background, you can't see the molecule
		q := fmt.Sprintf(`SELECT mol_to_svg($1::mol,'%d', 100, 100, '{"clearBackground": 0}')`, reagent.Id)
		svgRow := db.QueryRow(q, mol.String)

		var molSvg string
		err = svgRow.Scan(&molSvg)
		if err != nil {
			log.Fatalf("Error scanning query for mol_to_svg: %s", err)
		}
		e.MolSvg = molSvg

		r := &GetReagentsInExperimentResult{
			Experiment:  *expt,
			Reagent:     *reagent,
			Association: *e,
		}
		result = append(result, *r)
	}
	err = rows.Err()
	if err != nil {
		panic(err)
	}
	return result, err

}

func GetExperimentById(db *sql.DB, experimentId int) *Experiment {
	row := db.QueryRow(`
    SELECT id, name FROM experiment WHERE id=$1 
    `, experimentId)

	expt := &Experiment{}
	row.Scan(&expt.Id, &expt.Name)
	return expt
}

// make the initial assignment of the reagent to experiment
// amounts will be calculated later depending on the limiting reagent
func AssignReagentToExperiment(db *sql.DB, experimentId int, reagentId int, equivalents string, reactionSchemeLocation string, limitingReagent bool) error {
	_, err := db.Exec(`
    INSERT INTO experiment_reagent_association
    (exp_id, reagent_id, reaction_scheme_location, equivalents, limiting_reagent)
    VALUES
    ($1, $2, $3, $4, $5)
    `, experimentId,
		reagentId,
		reactionSchemeLocation,
		equivalents,
		limitingReagent)

	return err
}
