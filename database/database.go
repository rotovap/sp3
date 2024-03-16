package database

import (
	"database/sql"
	_ "github.com/lib/pq"
	"log"
	"os"
)

func Connect() *sql.DB {
	// intended for local only app. just hardcoded connection string here
	db, err := sql.Open("postgres", os.Getenv("POSTGRESQL_URL"))
	if err != nil {
		log.Fatal(err)
	}
	return db
}
