import {
  Button,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { SearchResult } from "./SearchReagents";

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

interface Props {
  setOpenSearchExisting: Dispatch<SetStateAction<boolean>>;
  setOpenSearchPubChem: Dispatch<SetStateAction<boolean>>;
  setSearchResults: Dispatch<SetStateAction<SearchResult[]>>;
}

export const SearchPubChem = ({
  setOpenSearchExisting,
  setOpenSearchPubChem,
  setSearchResults,
}: Props) => {
  const [pubchemInput, setPubchemInput] = useState<string>();

  useState<PubChemResponseParsed>();
  const [pubChemHelperText, setPubChemHelperText] = useState<string>();

  const searchPubChem = async () => {
    const response = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${pubchemInput}/property/MolecularWeight,CanonicalSMILES/json`,
    );

    if (response.status === 200) {
      const result: PubChemResponse = await response.json();
      const pcProperties = result.PropertyTable.Properties[0];
      const pubchemSMILES = pcProperties.CanonicalSMILES;
      // const cid = pcProperties.CID;

      setSearchResults([
        {
          smiles: pubchemSMILES,
          name: pubchemInput,
        },
      ]);
      setPubChemHelperText("Reagent found in PubChem");
    } else {
      setSearchResults([]);
      setPubChemHelperText("Not found in PubChem");
    }
  };

  return (
    <>
      <DialogContent>
        <Stack>
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
            }}
          />
          <Stack
            alignContent="center"
            justifyContent="center"
            direction="row"
            spacing={3}
          >
            <Button
              variant="contained"
              onClick={() => {
                setOpenSearchExisting(true);
                setOpenSearchPubChem(false);
                setSearchResults([]);
              }}
            >
              Back
            </Button>
            <Button variant="contained" onClick={() => searchPubChem()}>
              Search name on PubChem
            </Button>
          </Stack>

          {pubChemHelperText ? (
            <Typography>{pubChemHelperText}</Typography>
          ) : null}
        </Stack>
      </DialogContent>
    </>
  );
};
