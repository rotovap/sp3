package main

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"

	"github.com/rotovap/sp3/database"
	"github.com/rotovap/sp3/models"
)

func (env *Env) getExperimentHandler(w http.ResponseWriter, r *http.Request) {

	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}
	result, err := models.GetReagentsInExperiment(env.db, id)
	var leftSideReagents []models.ExperimentReagentAssociation
	var rightSideReagents []models.ExperimentReagentAssociation
	for _, r := range result {
		if r.Association.ReactionSchemeLocation.String == "LEFT_SIDE" {
			leftSideReagents = append(leftSideReagents, r.Association)
		} else if r.Association.ReactionSchemeLocation.String == "RIGHT_SIDE" {
			rightSideReagents = append(rightSideReagents, r.Association)
		}
	}

	ExperimentPage(id, result, leftSideReagents, rightSideReagents).Render(r.Context(), w)

}

// https://www.alexedwards.net/blog/organising-database-access
type Env struct {
	db *sql.DB
}

func main() {

	mux := http.NewServeMux()
	db := database.Connect()
	env := &Env{db: db}
	defer env.db.Close()

	mux.HandleFunc("GET /experiment/{id}/", env.getExperimentHandler)
	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe("localhost:8000", mux))

}
