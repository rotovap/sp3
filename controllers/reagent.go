package controllers

import (
	"log"
	"net/http"

	"github.com/rotovap/sp3/models"
	"github.com/rotovap/sp3/views"
)

func (env *Env) GetSimilarReagentsByNameHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		log.Printf("Error parsing form: %s", err)
	}
	query := r.FormValue("search")
	if query != "" {
		reagents, err := models.GetSimilarReagents(env.Db, query)

		if err != nil {
			log.Fatal(err)
		}

		views.ReagentSearchResultsTable(reagents).Render(r.Context(), w)

	}

}

func (env *Env) GetAddReagentPageHandler(w http.ResponseWriter, r *http.Request) {
	views.AddReagentPage().Render(r.Context(), w)
}
