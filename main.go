package main

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"
)

type ExperimentAndReagents struct {
	name, reactionSchemeLocation, amountPlannedUnit, reagentName sql.NullString
	reagentId                                                    sql.NullInt16
	equivalents, amountPlannedInGrams, molecularWeight, density  sql.NullFloat64
	limitingReagent                                              sql.NullBool
	molSvg                                                       string
}

func (SqlDb *SqlDb) getReagentsInExperiment(experimentId int) ([]ExperimentAndReagents, error) {
	// following example from:
	// https://www.calhoun.io/querying-for-a-single-record-using-gos-database-sql-package/
	rows, err := SqlDb.db.Query(`
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
	// var name, reaction_scheme_location, amount_planned_unit sql.NullString
	// var reagent_id sql.NullInt16
	// var amount_planned_in_grams sql.NullFloat64
	var r []ExperimentAndReagents
	var mol sql.NullString
	for rows.Next() {
		e := &ExperimentAndReagents{}
		err = rows.Scan(&e.name,
			&e.reactionSchemeLocation,
			&e.amountPlannedUnit,
			&e.reagentId,
			&e.equivalents,
			&e.limitingReagent,
			&e.amountPlannedInGrams,
			&e.reagentName,
			&e.molecularWeight,
			&e.density,
			&mol)
		if err != nil {
			panic(err)
		}
		headerLen := len("<?xml version='1.0' encoding='iso-8859-1'?>")
		e.molSvg = mol.String[headerLen:]
		r = append(r, *e)
	}
	err = rows.Err()
	if err != nil {
		panic(err)
	}
	return r, err

}

func (SqlDb *SqlDb) getExperimentHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	result, err := SqlDb.getReagentsInExperiment(id)
	var leftSideReagents []ExperimentAndReagents
	var rightSideReagents []ExperimentAndReagents
	for _, r := range result {
		if r.reactionSchemeLocation.String == "LEFT_SIDE" {
			leftSideReagents = append(leftSideReagents, r)
		} else if r.reactionSchemeLocation.String == "RIGHT_SIDE" {
			rightSideReagents = append(rightSideReagents, r)
		}
	}

	ExperimentPage(id, result, leftSideReagents, rightSideReagents).Render(r.Context(), w)

}

func main() {

	mux := http.NewServeMux()
	sqlDb := NewSqlDbConn()
	defer sqlDb.db.Close()

	mux.HandleFunc("GET /experiment/{id}/", sqlDb.getExperimentHandler)
	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe("localhost:8000", mux))

}
