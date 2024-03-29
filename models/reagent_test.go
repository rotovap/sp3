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

		// strip out the Mol XML string because it is a big string to match
		// just check that it's valid
		type ReagentWithoutMolXML struct {
			Id              int
			Name            sql.NullString
			MolecularWeight float64
			Density         sql.NullFloat64
			MolIsValid      bool
		}

		var resultWithoutMolXML []ReagentWithoutMolXML
		for _, r := range result {
			resultWithoutMolXML = append(resultWithoutMolXML,
				ReagentWithoutMolXML{
					Id:              r.Id,
					Name:            r.Name,
					MolecularWeight: r.MolecularWeight,
					Density:         r.Density,
					MolIsValid:      r.Mol.Valid,
				})
		}

		expectedResult := []ReagentWithoutMolXML{{
			Id:              3,
			Name:            sql.NullString{String: "THF", Valid: true},
			MolecularWeight: 72.11,
			Density:         sql.NullFloat64{Float64: 0.888, Valid: true},
			MolIsValid:      true,
		}, {Id: 7,
			Name:            sql.NullString{String: "TBAB", Valid: true},
			MolecularWeight: 322.37,
			Density:         sql.NullFloat64{Float64: 0, Valid: false},
			MolIsValid:      true,
		}}

		if !reflect.DeepEqual(expectedResult, resultWithoutMolXML) {
			t.Errorf("expected %v, got %v", expectedResult, resultWithoutMolXML)
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
