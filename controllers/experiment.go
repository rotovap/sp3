package controllers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/rotovap/sp3/models"
	"github.com/rotovap/sp3/views"
)

// https://www.alexedwards.net/blog/organising-database-access
type Env struct {
	Db *sql.DB
}

func (env *Env) GetExperimentHandler(w http.ResponseWriter, r *http.Request) {

	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}
	result, err := models.GetReagentsInExperiment(env.Db, id)
	var leftSideReagents []models.ExperimentReagentAssociation
	var rightSideReagents []models.ExperimentReagentAssociation
	for _, r := range result {
		if r.Association.ReactionSchemeLocation.String == "LEFT_SIDE" {
			leftSideReagents = append(leftSideReagents, r.Association)
		} else if r.Association.ReactionSchemeLocation.String == "RIGHT_SIDE" {
			rightSideReagents = append(rightSideReagents, r.Association)
		}
	}

	views.ExperimentPage(id, result, leftSideReagents, rightSideReagents).Render(r.Context(), w)

}
