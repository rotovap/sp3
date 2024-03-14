package main

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"
)

func (SqlDb *SqlDb) getExperimentById(id int) (string, error) {
	// following example from:
	// https://www.calhoun.io/querying-for-a-single-record-using-gos-database-sql-package/
	row := SqlDb.db.QueryRow("SELECT name FROM experiment WHERE id=$1",
		id)

	var name sql.NullString
	err := row.Scan(&name)
	switch err {
	case sql.ErrNoRows:

	case nil:
		// if there is no error, then the rows were found
		break
	default:
		// if there is an error and it's not ErrNoRows error
		panic(err)
	}

	return name.String, err

}

func (SqlDb *SqlDb) getExperimentHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	name, err := SqlDb.getExperimentById(id)

	ExperimentPage(id, name).Render(r.Context(), w)

}

func main() {

	mux := http.NewServeMux()
	sqlDb := NewSqlDbConn()
	defer sqlDb.db.Close()
	seedDb(sqlDb)

	mux.HandleFunc("GET /experiment/{id}/", sqlDb.getExperimentHandler)
	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe("localhost:8000", mux))

}
