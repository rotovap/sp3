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

	mux.HandleFunc("GET /experiment/{id}/", env.GetExperimentHandler)
	// for finding similar reagents, use `?like=query`
	mux.HandleFunc("POST /searchReagents", env.GetSimilarReagentsByNameHandler)
	mux.HandleFunc("GET /addReagent", env.GetAddReagentPageHandler)
	log.Println("Listening on :8000")
	log.Fatal(http.ListenAndServe("localhost:8000", mux))

}
