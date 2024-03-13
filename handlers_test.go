package main

import (
	"database/sql"
	"fmt"
	"log"
	"testing"

	"github.com/golang-migrate/migrate"
	"github.com/golang-migrate/migrate/database/postgres"
	_ "github.com/golang-migrate/migrate/database/postgres"
	_ "github.com/golang-migrate/migrate/source/file"
	_ "github.com/lib/pq"
)

func setupSuite() (*migrate.Migrate, *SqlDb) {
	sqlDb := NewSqlDbConn()
	driver, err := postgres.WithInstance(sqlDb.db, &postgres.Config{})
	if err != nil {
		fmt.Println(err)
	}
	m, err := migrate.NewWithDatabaseInstance("file://./db/migrations", "postgres", driver)
	if err != nil {
		fmt.Println(err)
	}
	// if the db hasn't been migrated at all yet, migrate up
	_, _, err = m.Version()
	if err == migrate.ErrNilVersion {
		fmt.Println("no migrations applied yet, migrating up...")
		m.Up()
	}
	return m, sqlDb
}

func migrateDownUp(m *migrate.Migrate, sqlDb *SqlDb) {
	// migrate down to remove anything in DB
	fmt.Println("Migrating down...")
	err := m.Down()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Migrating up...")
	err = m.Up()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("seeding database...")
	seedDb(sqlDb)

}

// func TestGetExperimentHandler(t *testing.T) {
// 	m, sqlDb := setupSuite()
// 	defer teardownSuite(m)
//
// 	req := httptest.NewRequest(http.MethodGet, "/experiment/1/", nil)
// 	res := httptest.NewRecorder()
//
// 	sqlDb.getExperimentHandler(res, req)
// 	if res.Code != http.StatusOK {
// 		t.Errorf("got status %d but wanted %d", res.Code, http.StatusOK)
// 	}
// }

func TestGetExperimentById(t *testing.T) {
	m, sqlDb := setupSuite()
	t.Run("finds an experiment by id", func(t *testing.T) {
		migrateDownUp(m, sqlDb)
		name, _ := sqlDb.getExperimentById(1)
		if name != "suzuki coupling" {
			t.Errorf("expected %s, got %s", "suzuki coupling", name)
		}
	})

	t.Run("returns nothing if experiment not found", func(t *testing.T) {
		migrateDownUp(m, sqlDb)
		_, err := sqlDb.getExperimentById(100)
		if err != sql.ErrNoRows {
			t.Errorf("expected %s, got %s", sql.ErrNoRows, err)
		}
	})

}
