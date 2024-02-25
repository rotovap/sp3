import {
  Button,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import {
  GetReagentHandlerResponse,
  GetSimilarReagentsByNameHandlerResponse,
} from "../../../server/routes/reagents";
import MoleculeStructure from "./MoleculeStructure/MoleculeStructure";

export const AddReagentDialog = () => {
  const [input, setInput] = useState<string>();
  const [nameQueryResults, setNameQueryResults] =
    useState<GetSimilarReagentsByNameHandlerResponse>();
  const [smilesQueryResults, setSmilesQueryResults] =
    useState<GetReagentHandlerResponse>();

  const searchReagents = async (query: string) => {
    if (query !== "") {
      const nameResponse = await fetch(
        `http://localhost:3000/reagents/getSimilarReagentsByName?name=${query}`,
      );

      if (window.RDKit.get_mol(query)?.is_valid()) {
        // salts have "." and "[" and "]" characters in the smiles
        // needs to be uri encoded
        const encodedSMILES = encodeURIComponent(query);
        const smilesResponse = await fetch(
          `http://localhost:3000/reagents?smiles=${encodedSMILES}`,
        );
        const smilesResult: GetReagentHandlerResponse =
          await smilesResponse.json();

        if (smilesResult.reagent) {
          setSmilesQueryResults(smilesResult);
        } else {
          setSmilesQueryResults(undefined);
        }
      }

      const nameResult: GetSimilarReagentsByNameHandlerResponse =
        await nameResponse.json();
      if (nameResult.reagents.length > 0) {
        setNameQueryResults(nameResult);
      }
    } else {
      setNameQueryResults(undefined);
      setSmilesQueryResults(undefined);
    }
  };

  return (
    <>
      <DialogTitle>Add Reagent</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography component={"span"} variant="body2">
            Enter the name or SMILES of the reagent. Your database will be
            searched to see if this has already been added in the past, or you
            can search PubChem for the reagent by its name.
          </Typography>
        </DialogContentText>
        <TextField
          label={"Enter name or SMILES"}
          value={input}
          autoFocus
          margin="normal"
          id="name-or-smiles"
          fullWidth
          variant="standard"
          onChange={(event) => {
            setInput(event.target.value);
            searchReagents(event.target.value);
          }}
        />

        {nameQueryResults ? (
          <List>
            <Typography>Reagents found in DB with similar name: </Typography>
            {nameQueryResults.reagents.map((i) => (
              <ListItemButton>
                <ListItemText>{i.name}</ListItemText>
              </ListItemButton>
            ))}
          </List>
        ) : null}

        {smilesQueryResults ? (
          <List>
            <Typography>Reagents found in DB by SMILES: </Typography>

            <ListItemButton>
              <MoleculeStructure
                id="structure"
                structure={smilesQueryResults.reagent?.canonicalSMILES ?? ""}
              />
              <Typography>{smilesQueryResults?.reagent?.name}</Typography>
            </ListItemButton>
          </List>
        ) : null}

        {input && !smilesQueryResults && !nameQueryResults ? (
          <Typography>Nothing found in DB for this query</Typography>
        ) : null}

        <Button
          variant="contained"
          onClick={async () => {
            type PubChemResponse = {
              PropertyTable: {
                Properties: {
                  CID: string;
                  MolecularWeight: string;
                  CanonicalSMILES: string;
                }[];
              };
            };
            const response = await fetch(
              `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${input}/property/MolecularWeight,CanonicalSMILES/json`,
            );

            console.log(await response.json());
          }}
        >
          Search name on PubChem
        </Button>
      </DialogContent>
    </>
  );
};
