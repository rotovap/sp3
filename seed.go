package main

import (
	"fmt"
	"log"
	"strings"
)

func seedExperiments(sqlDb *SqlDb) {
	experiments := `
    ('01012024-random reaction'),
    ('01012024-suzuki coupling'),
    ('An experiment with no reagents yet')
    `

	stmt := fmt.Sprintf("INSERT INTO experiment (name) VALUES %s", experiments)
	_, err := sqlDb.db.Exec(stmt)

	if err != nil {
		log.Println(err)
		log.Fatal("Error inserting experiments")
	}
}

func seedReagents(sqlDb *SqlDb) {
	reagents := `('ethanol', 'CCO', 46.07, 0.79),
        ('butane', 'CCCC', 58.12, 0.6),
        ('thf', 'C1CCOC1', 72.11, 0.888),
        ('diethyl(3-pyridyl)borane', 'CCB(CC)c1cccnc1', 147.03, NULL),
        ('1-bromo-3-(methylsulfonyl)benzene','CS(=O)(=O)c1cccc(Br)c1', 235.10, NULL),
        ('Pd(PPh3)4', 
            '[Pd]([P](c1ccccc1)(c1ccccc1)c1ccccc1)([P](c1ccccc1)(c1ccccc1)c1ccccc1)([P](c1ccccc1)(c1ccccc1)c1ccccc1)[P](c1ccccc1)(c1ccccc1)c1ccccc1',
            1154.26803,
            NULL),
        ('tbab', 'CCCC[N+](CCCC)(CCCC)CCCC.[Br-]', 322.37, NULL),
        ('K2CO3', 'O=C([O-])[O-].[K+].[K+]', 138.205, NULL),
        (NULL, 'CS(=O)(=O)c1cccc(-c2cccnc2)c1', 233.05104, NULL)`

	stmt := fmt.Sprintf(`INSERT INTO reagent (name, mol, molecular_weight, density) VALUES %s`, reagents)
	_, err := sqlDb.db.Exec(stmt)

	if err != nil {
		log.Println(err)
		log.Fatal("Error inserting reagents")
	}
}

type ExperimentReagentAssociation struct {
	expId                  int
	reagentId              int
	reactionSchemeLocation string
	equivalents            float32
	limitingReagent        bool
	amountPlannedInGrams   float32
	amountPlannedUnit      string
}

func seedAssignReagentsToExperiments(sqlDb *SqlDb) {
	assignments := []ExperimentReagentAssociation{
		{
			reagentId:              2,
			expId:                  1,
			reactionSchemeLocation: "ABOVE_ARROW",
			equivalents:            1,
			limitingReagent:        false,
			amountPlannedInGrams:   20,
			amountPlannedUnit:      "G"},
		{
			reagentId:              3,
			expId:                  1,
			reactionSchemeLocation: "BELOW_ARROW",
			equivalents:            1,
			amountPlannedInGrams:   20,
			amountPlannedUnit:      "ML",
			limitingReagent:        false},
		{
			reagentId:              4,
			expId:                  2,
			reactionSchemeLocation: "LEFT_SIDE",
			equivalents:            1,
			limitingReagent:        true,
		},
		{
			reagentId:              5,
			expId:                  2,
			reactionSchemeLocation: "LEFT_SIDE",
			equivalents:            1,
			limitingReagent:        false,
		},
		{
			reagentId:              6,
			expId:                  2,
			reactionSchemeLocation: "ABOVE_ARROW",
			equivalents:            1,
			limitingReagent:        false,
		},
		{
			reagentId:              7,
			expId:                  2,
			reactionSchemeLocation: "BELOW_ARROW",
			equivalents:            1,
			limitingReagent:        false,
		},
		{
			reagentId:              8,
			expId:                  2,
			reactionSchemeLocation: "BELOW_ARROW",
			equivalents:            1,
			limitingReagent:        false,
		},
		{
			reagentId:              9,
			expId:                  2,
			reactionSchemeLocation: "RIGHT_SIDE",
			equivalents:            1,
			limitingReagent:        false,
		},
	}

	var assignmentStrings []string
	for _, a := range assignments {
		s := fmt.Sprintf(`(%d, %d, '%s', %f, %t)`,
			a.reagentId,
			a.expId,
			a.reactionSchemeLocation,
			a.equivalents,
			a.limitingReagent)
		assignmentStrings = append(assignmentStrings, s)
	}
	values := strings.Join(assignmentStrings[:], ",")
	stmt := fmt.Sprintf(`
    INSERT INTO experiment_reagent_association 
    (reagent_id, exp_id, reaction_scheme_location, equivalents, limiting_reagent )
    VALUES %s`, values)
	_, err := sqlDb.db.Exec(stmt)
	if err != nil {
		log.Fatalf("Error inserting experiment_reagent_association: %s", err)
	}

}

func seedDb(sqlDb *SqlDb) {
	seedExperiments(sqlDb)
	seedReagents(sqlDb)
	seedAssignReagentsToExperiments(sqlDb)
}
