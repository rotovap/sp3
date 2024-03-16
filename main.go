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
	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe("localhost:8000", mux))

}
