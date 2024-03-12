package main

import (
	"database/sql"
	_ "github.com/lib/pq"
	"log"
	"os"
)

type SqlDb struct {
	db *sql.DB
}

func NewSqlDbConn() *SqlDb {
	// intended for local only app. just hardcoded connection string here
	db, err := sql.Open("postgres", os.Getenv("POSTGRESQL_URL"))
	if err != nil {
		log.Fatal(err)
	}

	return &SqlDb{db: db}
}
