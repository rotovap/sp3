package models

import (
	"database/sql"
	"reflect"
	"testing"
)

func NewX[K any](m K) *K { return &m }

func TestGetSimilarReagents(t *testing.T) {
	mEnv := setupSuite(t)

	t.Run("finds similar reagents", func(t *testing.T) {
		mEnv.migrateDownUp()
		result, _ := GetSimilarReagents(mEnv.db, "t")

		er := []Reagent{{
			Id:              3,
			Name:            sql.NullString{String: "THF", Valid: true},
			MolecularWeight: 72.11,
			Density:         sql.NullFloat64{Float64: 0.888, Valid: true},
			Mol:             sql.NullString{String: "C1CCOC1", Valid: true},
		}, {Id: 7,
			Name:            sql.NullString{String: "TBAB", Valid: true},
			MolecularWeight: 322.37,
			Density:         sql.NullFloat64{Float64: 0, Valid: false},
			Mol:             sql.NullString{String: "CCCC[N+](CCCC)(CCCC)CCCC.[Br-]", Valid: true},
		}}
		if !reflect.DeepEqual(er, result) {
			t.Errorf("expected %v, got %v", er, result)
		}
	})

	t.Run("returns empty array if no matches", func(t *testing.T) {
		mEnv.migrateDownUp()

		result, _ := GetSimilarReagents(mEnv.db, "z")

		if !reflect.DeepEqual([]Reagent{}, result) {
			t.Errorf("expected empty array, got %v", result)
		}
	})
}
