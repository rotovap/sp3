package models

import (
	"database/sql"
	"log"
	"reflect"
	"strings"
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

	t.Run("returns empty slice if experiment not found", func(t *testing.T) {
		mEnv.migrateDownUp()
		result, _ := GetReagentsInExperiment(mEnv.db, 100)
		if len(result) != 0 {
			t.Errorf("expected empty slice, got %v", result)
		}
	})

}

func TestAssignReagentToExperiment(t *testing.T) {
	mEnv := setupSuite(t)

	t.Run("assigns a reagent to an experiment", func(t *testing.T) {
		mEnv.migrateDownUp()
		err := AssignReagentToExperiment(mEnv.db, 3, 1, "2", "ABOVE_ARROW", false)
		if err != nil {
			t.Errorf("expected no error, got: %s", err)
		}
		// check the db for the right result
		row := mEnv.db.QueryRow(`
        SELECT 
              exp_id, 
              reagent_id,
              equivalents,
              reaction_scheme_location,
              limiting_reagent
        FROM experiment_reagent_association WHERE exp_id=$1`,
			3)
		res := database.ExperimentReagentAssociation{}
		row.Scan(&res.ExpId,
			&res.ReagentId,
			&res.Equivalents,
			&res.ReactionSchemeLocation,
			&res.LimitingReagent)

		expectedResult := database.ExperimentReagentAssociation{
			ExpId:                  3,
			ReagentId:              1,
			Equivalents:            2,
			ReactionSchemeLocation: "ABOVE_ARROW",
			LimitingReagent:        false,
		}
		if !reflect.DeepEqual(expectedResult, res) {
			t.Errorf("expected %v, got %v", expectedResult, res)
		}
	})

	t.Run("cannot add reagent to the same experiment twice", func(t *testing.T) {
		mEnv.migrateDownUp()
		err := AssignReagentToExperiment(mEnv.db, 1, 2, "2", "ABOVE_ARROW", false)
		if !strings.Contains(err.Error(), "duplicate key value") {
			t.Errorf("expected duplicate key value error but got: %s", err)
		}
	})
}
