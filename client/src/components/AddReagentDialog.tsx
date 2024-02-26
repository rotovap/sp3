import {
  Button,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  GetReagentHandlerResponse,
  GetSimilarReagentsByNameHandlerResponse,
} from "../../../server/routes/reagents";
import MoleculeStructure from "./MoleculeStructure/MoleculeStructure";

type PubChemResponse = {
  PropertyTable: {
    Properties: {
      CID: string;
      MolecularWeight: string;
      CanonicalSMILES: string;
    }[];
  };
};

interface PubChemResponseParsed {
  molecularWeight: number;
  smiles: string;
  cid: string;
}

export const AddReagentDialog = () => {
  const [nameInput, setNameInput] = useState<string>();
  const [smilesInput, setSmilesInput] = useState<string>();
  const [pubchemInput, setPubchemInput] = useState<string>();

  const [nameQueryResults, setNameQueryResults] =
    useState<GetSimilarReagentsByNameHandlerResponse>();
  const [nameHelperText, setNameHelperText] = useState<string>();

  const [smilesQueryResults, setSmilesQueryResults] =
    useState<GetReagentHandlerResponse>();
  const [smilesHelperText, setSmilesHelperText] = useState<string>();

  const [pubChemQueryResults, setPubChemQueryResults] =
    useState<PubChemResponseParsed>();
  const [pubChemHelperText, setPubChemHelperText] = useState<string>();

  useEffect(() => {
    // reset everything if the input is deleted by user
    if (nameInput === "") {
      setNameQueryResults(undefined);
    }

    if (smilesInput === "") {
      setSmilesQueryResults(undefined);
    }

    if (pubchemInput === "") {
      setPubChemQueryResults(undefined);
      setPubChemHelperText(undefined);
    }
  }, [nameInput, smilesInput, pubchemInput]);

  const searchDBByName = async (query: string) => {
    if (query !== "") {
      const nameResponse = await fetch(
        `http://localhost:3000/reagents/getSimilarReagentsByName?name=${query}`,
      );

      const nameResult: GetSimilarReagentsByNameHandlerResponse =
        await nameResponse.json();
      if (nameResult.reagents.length > 0) {
        setNameQueryResults(nameResult);
        setNameHelperText("Reagents found in DB with similar name:");
      } else {
        // if nothing found clear the results
        setNameQueryResults(undefined);
        setNameHelperText("Nothing found in DB with similar name");
      }
    } else {
      setNameQueryResults(undefined);
      setNameHelperText(undefined);
    }
  };

  const searchDBBySmiles = async (query: string) => {
    if (window.RDKit.get_mol(query)?.is_valid()) {
      // reset the name results if the user searches a valid smiles
      setNameQueryResults(undefined);
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
        setSmilesHelperText("Reagents found in DB by SMILES:");
      } else {
        setSmilesQueryResults(undefined);
        setSmilesHelperText("Nothing found in DB for this query");
      }
    } else {
      // if the user inputs an invalid smiles, the results should be cleared
      // it could be they are trying to search by name now
      setSmilesQueryResults(undefined);
      setSmilesHelperText("Invalid SMILES entered");
    }
  };

  return (
    <>
      <DialogTitle>Add Reagent</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography component={"span"} variant="body2">
            Search your database or PubChem for a reagent.
          </Typography>
        </DialogContentText>
        <Stack spacing={4}>
          <TextField
            label={"Search DB by name"}
            value={nameInput}
            autoFocus
            margin="normal"
            id="name-search"
            fullWidth
            variant="standard"
            onChange={(event) => {
              setNameInput(event.target.value);
              searchDBByName(event.target.value);
            }}
          />

          {nameHelperText ? <Typography>{nameHelperText}</Typography> : null}

          {nameQueryResults ? (
            <List>
              {nameQueryResults.reagents.map((i) => (
                <ListItemButton>
                  <ListItemText>{i.name}</ListItemText>
                </ListItemButton>
              ))}
            </List>
          ) : null}

          <TextField
            label={"Search DB by SMILES"}
            value={smilesInput}
            autoFocus
            margin="normal"
            id="smiles-search"
            fullWidth
            variant="standard"
            onChange={(event) => {
              setSmilesInput(event.target.value);
              searchDBBySmiles(event.target.value);
            }}
          />

          {smilesHelperText ? (
            <Typography>{smilesHelperText}</Typography>
          ) : null}

          {smilesQueryResults ? (
            <List>
              <ListItemButton>
                <MoleculeStructure
                  id="structure"
                  structure={smilesQueryResults.reagent?.canonicalSMILES ?? ""}
                />
                <Typography>{smilesQueryResults?.reagent?.name}</Typography>
              </ListItemButton>
            </List>
          ) : null}

          <TextField
            label={"Search PubChem by name"}
            value={pubchemInput}
            autoFocus
            margin="normal"
            id="pubchem-search"
            fullWidth
            variant="standard"
            onChange={(event) => {
              setPubchemInput(event.target.value);
              searchDBByName(event.target.value);
            }}
          />

          <Button
            variant="contained"
            onClick={async () => {
              const response = await fetch(
                `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${nameInput}/property/MolecularWeight,CanonicalSMILES/json`,
              );

              if (response.status === 200) {
                const result: PubChemResponse = await response.json();
                const pcProperties = result.PropertyTable.Properties[0];
                const pubchemSMILES = pcProperties.CanonicalSMILES;
                const cid = pcProperties.CID;

                setPubChemQueryResults({
                  molecularWeight: Number(pcProperties.MolecularWeight),
                  smiles: pubchemSMILES,
                  cid: cid,
                });
                setPubChemHelperText("Reagent found in PubChem");
              } else {
                setPubChemQueryResults(undefined);
                setPubChemHelperText("Not found in PubChem");
              }
            }}
          >
            Search name on PubChem
          </Button>

          {pubChemHelperText ? (
            <Typography>{pubChemHelperText}</Typography>
          ) : null}

          {pubChemQueryResults ? (
            <List>
              <ListItemButton>
                <MoleculeStructure
                  id="structure"
                  structure={pubChemQueryResults.smiles}
                />
                <Typography>{nameInput}</Typography>
              </ListItemButton>
            </List>
          ) : null}
        </Stack>
      </DialogContent>
    </>
  );
};
