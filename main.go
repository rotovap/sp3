package main

import (
	"log"
	"net/http"

	"github.com/rotovap/sp3/controllers"
	"github.com/rotovap/sp3/database"
)

func main() {

	mux := http.NewServeMux()
	db := database.Connect()
	env := &controllers.Env{Db: db}
	defer env.Db.Close()

	// show experiment page
	mux.HandleFunc("GET /experiment/{id}/", env.GetExperimentHandler)
	// select the reagent to assign to the experiment and then go to add details
	mux.HandleFunc("GET /experiment/{id}/addReagent/{reagentId}", env.SelectReagentToAssignToExperimentHandler)
	// run the search for reagents in order to add them to the experiment
	mux.HandleFunc("POST /experiment/{id}/addReagent/searchReagents", env.GetSimilarReagentsByNameHandler)
	// get the search for reagents page in order to add reagent to the experiment
	mux.HandleFunc("GET /experiment/{id}/addReagent", env.GetAddReagentToExperimentPageHandler)
	mux.HandleFunc("GET /reagentStructure/{id}", env.GetReagentStructure)
	log.Println("Listening on :8000")
	log.Fatal(http.ListenAndServe("localhost:8000", mux))

}
