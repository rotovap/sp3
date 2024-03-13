package main

import (
	"fmt"
	"log"
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

func seedDb(sqlDb *SqlDb) {

	seedExperiments(sqlDb)
	seedReagents(sqlDb)

}
