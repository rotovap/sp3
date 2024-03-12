package main

import (
	"database/sql"
	"fmt"
	"testing"

	"github.com/golang-migrate/migrate"
	"github.com/golang-migrate/migrate/database/postgres"
	_ "github.com/golang-migrate/migrate/database/postgres"
	_ "github.com/golang-migrate/migrate/source/file"
	_ "github.com/lib/pq"
)

func setupSuite() *SqlDb {
	sqlDb := NewSqlDbConn()
	driver, err := postgres.WithInstance(sqlDb.db, &postgres.Config{})
	if err != nil {
		fmt.Println(err)
	}
	m, err := migrate.NewWithDatabaseInstance("file://./db/migrations", "postgres", driver)
	if err != nil {
		fmt.Println(err)
	}
	// migrate down to remove anything in DB
	fmt.Println("Migrating down...")
	err = m.Down()
	if err != nil {
		fmt.Println(err)
	}

	fmt.Println("Migrating up...")
	err = m.Up()
	if err != nil {
		fmt.Println(err)
	}

	fmt.Println("seeding database...")
	seedDb(sqlDb)

	return sqlDb
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
	sqlDb := setupSuite()
	t.Run("finds an experiment by id", func(t *testing.T) {
		name, _ := sqlDb.getExperimentById(1)
		if name != "suzuki coupling" {
			t.Errorf("expected %s, got %s", "suzuki coupling", name)
		}
	})

	t.Run("returns nothing if experiment not found", func(t *testing.T) {
		_, err := sqlDb.getExperimentById(100)
		if err != sql.ErrNoRows {
			t.Errorf("expected %s, got %s", sql.ErrNoRows, err)
		}
	})

}
