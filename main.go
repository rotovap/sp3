package main

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"
)

type ExperimentAndReagents struct {
	name, reactionSchemeLocation, amountPlannedUnit, reagentName, mol sql.NullString
	reagentId                                                         sql.NullInt16
	equivalents, amountPlannedInGrams, molecularWeight, density       sql.NullFloat64
	limitingReagent                                                   sql.NullBool
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
                r.mol
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
			&e.mol)
		if err != nil {
			panic(err)
		}
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
	ExperimentPage(id, result).Render(r.Context(), w)

}

func main() {

	mux := http.NewServeMux()
	sqlDb := NewSqlDbConn()
	defer sqlDb.db.Close()

	mux.HandleFunc("GET /experiment/{id}/", sqlDb.getExperimentHandler)
	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe("localhost:8000", mux))

}
