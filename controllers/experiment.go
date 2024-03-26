package controllers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/rotovap/sp3/models"
	"github.com/rotovap/sp3/views/experiment_views"
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

	experiment_views.ExperimentPage(id, result[0].Experiment.Name, result, leftSideReagents, rightSideReagents).Render(r.Context(), w)

}

// search the DB
func (env *Env) GetSimilarReagentsByNameHandler(w http.ResponseWriter, r *http.Request) {
	// right now this is only used in adding reagent to experiments
	// this might be useful in another place to search for reagents
	experimentId := r.PathValue("id")
	err := r.ParseForm()
	if err != nil {
		log.Printf("Error parsing form: %s", err)
	}
	query := r.FormValue("search")
	reagents, err := models.GetSimilarReagents(env.Db, query)

	if err != nil {
		log.Fatal(err)
	}

	experiment_views.ReagentSearchResultsTable(reagents, experimentId).Render(r.Context(), w)

}

func (env *Env) ReagentSearchForExperimentHandler(w http.ResponseWriter, r *http.Request) {
	// pass the experiment Id along from the URL path so that the reagent can be assigned to that experiment
	experimentId := r.PathValue("id")

	// start off populating the list with all reagents in the DB
	// after getting input, the DB will be searched and the resulting list replaced
	reagents, err := models.GetSimilarReagents(env.Db, "")

	if err != nil {
		log.Fatal(err)
	}

	experiment_views.ReagentSearchPage(experimentId, reagents).Render(r.Context(), w)
}

func (env *Env) SelectReagentToAssignToExperimentHandler(w http.ResponseWriter, r *http.Request) {
	experimentId := r.PathValue("id")
	reagentId := r.PathValue("reagentId")

	experimentIdInt, err := strconv.Atoi(experimentId)
	if err != nil {
		log.Fatalf("Error parsing experiment id parameter: %s", experimentId)
	}
	reagentIdInt, err := strconv.Atoi(reagentId)
	if err != nil {
		log.Fatalf("Error parsing reagent id parameter: %s", reagentId)
	}

	experiment := models.GetExperimentById(env.Db, experimentIdInt)
	reagent, molSVG := models.GetReagentById(env.Db, reagentIdInt)

	// after the reagent is selected go to the page to add details to the experiment
	experiment_views.AddReagentDetailsToExperiment(experimentId, experiment.Name, *reagent, molSVG).Render(r.Context(), w)
}

func (env *Env) AssignReagentToExperimentHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		log.Fatalf("error parsing form in AssignReagentToExperimentHandler: %s", err)
	}

	experimentId := r.PathValue("id")
	// reagentId := r.PathValue("reagentId")

	eq := r.FormValue("equivalents")
	loc := r.FormValue("reaction-scheme-location")
	if eq == "" {
		fmt.Println("EMPTy")
		// TODO: replace the form again if empty with aria-invalid=true
		env.SelectReagentToAssignToExperimentHandler(w, r)
	} else {
		// otherwise go back to the experiment page because it was successful
		// TODO: save to db
		fmt.Println(eq, loc, experimentId)
		fmt.Println("HERE")
		http.Redirect(w, r, fmt.Sprintf("/experiment/%s", experimentId), 302)
	}
}
