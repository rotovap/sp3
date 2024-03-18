package controllers

import (
	"fmt"
	"log"
	"net/http"

	"github.com/rotovap/sp3/models"
)

func (env *Env) GetSimilarReagentsByNameHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.URL.Query())
	query := r.URL.Query().Get("like")
	fmt.Println(query)
	reagents, err := models.GetSimilarReagents(env.Db, query)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(reagents)

}
