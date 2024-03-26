package controllers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/rotovap/sp3/models"
	"github.com/rotovap/sp3/views/shared/molecule_structure"
)

func (env *Env) GetReagentStructure(w http.ResponseWriter, r *http.Request) {
	reagentId := r.PathValue("id")
	reagentIdInt, err := strconv.Atoi(reagentId)
	if err != nil {
		log.Fatalf("Error parsing reagent id parameter: %s", reagentId)
	}
	_, molSVG := models.GetReagentById(env.Db, reagentIdInt)
	molecule_structure.MoleculeStructure(molSVG).Render(r.Context(), w)
}
