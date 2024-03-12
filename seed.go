package main

import (
	"log"
)

func seedExperiments(sqlDb *SqlDb) {
	_, err := sqlDb.db.Exec("INSERT INTO experiments (name) VALUES ($1), ($2)",
		"suzuki coupling", "amide coupling")

	if err != nil {
		log.Println(err)
		log.Fatal("Error inserting experiments")
	}
}

func seedDb(sqlDb *SqlDb) {

	seedExperiments(sqlDb)

}
