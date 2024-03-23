package controllers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/rotovap/sp3/models"
	"github.com/rotovap/sp3/views"
)

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

	views.ReagentSearchResultsTable(reagents, experimentId).Render(r.Context(), w)

}

func (env *Env) GetAddReagentToExperimentPageHandler(w http.ResponseWriter, r *http.Request) {
	// pass the experiment Id along from the URL path so that the reagent can be assigned to that experiment
	experimentId := r.PathValue("id")

	// start off populating the list with all reagents in the DB
	// after getting input, the DB will be searched and the resulting list replaced
	reagents, err := models.GetSimilarReagents(env.Db, "")

	if err != nil {
		log.Fatal(err)
	}

	views.AddReagentToExperimentPage(experimentId, reagents).Render(r.Context(), w)
}

func (env *Env) SelectReagentToAssignToExperimentHandler(w http.ResponseWriter, r *http.Request) {
	experimentId := r.PathValue("id")
	reagentId := r.PathValue("reagentId")

	// TODO: make model to assign the reagent to the experiment
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
	views.AddReagentDetailsToExperiment(experimentId, experiment.Name, *reagent, molSVG).Render(r.Context(), w)
}

func (env *Env) GetReagentStructure(w http.ResponseWriter, r *http.Request) {
	reagentId := r.PathValue("id")
	reagentIdInt, err := strconv.Atoi(reagentId)
	if err != nil {
		log.Fatalf("Error parsing reagent id parameter: %s", reagentId)
	}
	_, molSVG := models.GetReagentById(env.Db, reagentIdInt)
	views.MoleculeStructure(molSVG).Render(r.Context(), w)
}
