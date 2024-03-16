package models

import (
	"database/sql"
	"log"
	"testing"

	"github.com/golang-migrate/migrate"
	"github.com/golang-migrate/migrate/database/postgres"
	_ "github.com/golang-migrate/migrate/database/postgres"
	_ "github.com/golang-migrate/migrate/source/file"
	_ "github.com/lib/pq"
	"github.com/rotovap/sp3/database"
)

type MigrateEnv struct {
	m  *migrate.Migrate
	db *sql.DB
	t  *testing.T
}

func setupSuite(t *testing.T) *MigrateEnv {
	db := database.Connect()
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		log.Fatal(err)
	}
	m, err := migrate.NewWithDatabaseInstance("file://../database/migrations", "postgres", driver)
	if err != nil {
		log.Fatal(err)
	}
	// if the db hasn't been migrated at all yet, migrate up
	_, _, err = m.Version()
	if err == migrate.ErrNilVersion {
		log.Print("no migrations applied yet, migrating up...")
		m.Up()
	}
	return &MigrateEnv{m: m, db: db, t: t}
}

func (mEnv *MigrateEnv) migrateDownUp() {
	// migrate down to remove anything in DB
	// fmt.Println("Migrating down...")
	mEnv.t.Log("Migrating down...")
	err := mEnv.m.Down()
	if err != nil {
		log.Fatal(err)
	}

	mEnv.t.Log("Migrating up...")
	err = mEnv.m.Up()
	if err != nil {
		log.Fatal(err)
	}

	mEnv.t.Log("seeding database...")
	database.SeedDb(mEnv.db)

}

func TestGetExperimentById(t *testing.T) {
	mEnv := setupSuite(t)
	// defer db.Close()
	t.Run("finds an experiment by id", func(t *testing.T) {
		mEnv.migrateDownUp()
		result, _ := GetReagentsInExperiment(mEnv.db, 1)
		name := result[0].Experiment.Name
		if name != "01012024-random reaction" {
			t.Errorf("expected %s, got %s", "01012024-random reaction", name)
		}
	})

	t.Run("returns nothing if experiment not found", func(t *testing.T) {
		mEnv.migrateDownUp()
		result, _ := GetReagentsInExperiment(mEnv.db, 100)
		if len(result) != 0 {
			t.Errorf("expected empty slice, got %v", result)
		}
	})

}
