package models

import (
	"database/sql"
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
                -- clearBackground: 0 will make a transparent background, but the bonds are black so on black background, you can't see the molecule
                mol_to_svg(r.mol,'', 100, 100, '{"clearBackground": 0}')
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
		headerLen := len("<?xml version='1.0' encoding='iso-8859-1'?>")
		e.MolSvg = mol.String[headerLen:]
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
