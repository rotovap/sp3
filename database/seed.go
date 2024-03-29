package database

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
)

func seedExperiments(db *sql.DB) {

	// use sprintf instead of parameterized query since this is not user input data
	// and many values need to be inserted
	// or could write a for loop to run an insert on each batch of n items to insert
	experiments := `('01012024-random reaction'),
    ('01012024-suzuki coupling'),
    ('An experiment with no reagents yet');`

	stmt := fmt.Sprintf("INSERT INTO experiment (name) VALUES %s", experiments)
	_, err := db.Exec(stmt)

	if err != nil {
		log.Println(err)
		log.Fatal("Error inserting experiments")
	}
}

func seedReagents(db *sql.DB) {
	reagents := `
        ('ethanol', 'CCO', 46.07, 0.79),
        ('butane', 'CCCC', 58.12, 0.6),
        ('THF', 'C1CCOC1', 72.11, 0.888),
        ('diethyl(3-pyridyl)borane', 'CCB(CC)c1cccnc1', 147.03, NULL),
        ('1-bromo-3-(methylsulfonyl)benzene','CS(=O)(=O)c1cccc(Br)c1', 235.10, NULL),
        ('Pd(PPh3)4', 
            '[Pd]([P](c1ccccc1)(c1ccccc1)c1ccccc1)([P](c1ccccc1)(c1ccccc1)c1ccccc1)([P](c1ccccc1)(c1ccccc1)c1ccccc1)[P](c1ccccc1)(c1ccccc1)c1ccccc1',
            1154.26803,
            NULL),
        ('TBAB', 'CCCC[N+](CCCC)(CCCC)CCCC.[Br-]', 322.37, NULL),
        ('K2CO3', 'O=C([O-])[O-].[K+].[K+]', 138.205, NULL),
        (NULL, 'CS(=O)(=O)c1cccc(-c2cccnc2)c1', 233.05104, NULL)`

	// use sprintf instead of parameterized query since this is not user input data
	// and many values need to be inserted
	// or could write a for loop to run an insert on each batch of n items to insert
	stmt := fmt.Sprintf(`INSERT INTO reagent (name, mol, molecular_weight, density) VALUES %s`, reagents)
	_, err := db.Exec(stmt)

	if err != nil {
		log.Println(err)
		log.Fatal("Error inserting reagents")
	}
}

type ExperimentReagentAssociation struct {
	ExpId                  int
	ReagentId              int
	ReactionSchemeLocation string
	Equivalents            float32
	LimitingReagent        bool
	AmountPlannedInGrams   float32
	AmountPlannedUnit      string
}

func seedAssignReagentsToExperiments(db *sql.DB) {
	assignments := []ExperimentReagentAssociation{
		{
			ReagentId:              2,
			ExpId:                  1,
			ReactionSchemeLocation: "ABOVE_ARROW",
			Equivalents:            1,
			LimitingReagent:        false,
			AmountPlannedInGrams:   20,
			AmountPlannedUnit:      "G"},
		{
			ReagentId:              3,
			ExpId:                  1,
			ReactionSchemeLocation: "BELOW_ARROW",
			Equivalents:            1,
			AmountPlannedInGrams:   20,
			AmountPlannedUnit:      "ML",
			LimitingReagent:        false},
		{
			ReagentId:              4,
			ExpId:                  2,
			ReactionSchemeLocation: "LEFT_SIDE",
			Equivalents:            1,
			LimitingReagent:        true,
		},
		{
			ReagentId:              5,
			ExpId:                  2,
			ReactionSchemeLocation: "LEFT_SIDE",
			Equivalents:            1,
			LimitingReagent:        false,
		},
		{
			ReagentId:              6,
			ExpId:                  2,
			ReactionSchemeLocation: "ABOVE_ARROW",
			Equivalents:            1,
			LimitingReagent:        false,
		},
		{
			ReagentId:              7,
			ExpId:                  2,
			ReactionSchemeLocation: "BELOW_ARROW",
			Equivalents:            1,
			LimitingReagent:        false,
		},
		{
			ReagentId:              8,
			ExpId:                  2,
			ReactionSchemeLocation: "BELOW_ARROW",
			Equivalents:            1,
			LimitingReagent:        false,
		},
		{
			ReagentId:              9,
			ExpId:                  2,
			ReactionSchemeLocation: "RIGHT_SIDE",
			Equivalents:            1,
			LimitingReagent:        false,
		},
	}

	var assignmentStrings []string
	for _, a := range assignments {
		s := fmt.Sprintf(`(%d, %d, '%s', %f, %t)`,
			a.ReagentId,
			a.ExpId,
			a.ReactionSchemeLocation,
			a.Equivalents,
			a.LimitingReagent)
		assignmentStrings = append(assignmentStrings, s)
	}
	values := strings.Join(assignmentStrings[:], ",")

	// use sprintf instead of parameterized query since this is not user input data
	// and many values need to be inserted
	// or could write a for loop to run an insert on each batch of n items to insert
	stmt := fmt.Sprintf(`
    INSERT INTO experiment_reagent_association 
    (reagent_id, exp_id, reaction_scheme_location, equivalents, limiting_reagent )
    VALUES %s`, values)

	_, err := db.Exec(stmt)
	if err != nil {
		log.Fatalf("Error inserting experiment_reagent_association: %s", err)
	}

}

func SeedDb(db *sql.DB) {
	seedExperiments(db)
	seedReagents(db)
	seedAssignReagentsToExperiments(db)
}
