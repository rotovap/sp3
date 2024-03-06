import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  GetReagentHandlerResponse,
  GetSimilarReagentsByNameHandlerResponse,
} from "../../../server/routes/reagents";
import {
  Button,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { SearchResult } from "./SearchReagents";

interface Props {
  setOpenSearchExisting: Dispatch<SetStateAction<boolean>>;
  setOpenAddNewReagent: Dispatch<SetStateAction<boolean>>;
  setSearchResults: Dispatch<SetStateAction<SearchResult[]>>;
}

export const SearchExistingReagents = ({
  setOpenSearchExisting,
  setOpenAddNewReagent,
  setSearchResults,
}: Props) => {
  const [nameInput, setNameInput] = useState<string>();
  const [smilesInput, setSmilesInput] = useState<string>();

  const [smilesHelperText, setSmilesHelperText] = useState<string>();

  const searchDBByName = async (query: string) => {
    if (query !== "") {
      const nameResponse = await fetch(
        `http://localhost:3000/reagents/getSimilarReagentsByName?name=${query}`,
      );

      const nameResult: GetSimilarReagentsByNameHandlerResponse =
        await nameResponse.json();
      if (nameResult.reagents.length > 0) {
        setSearchResults(
          nameResult.reagents.map((i) => {
            return {
              smiles: i.canonicalSMILES,
              name: i.name ?? undefined,
              molecularWeight: i.molecularWeight,
              density: i.density ?? undefined,
            };
          }),
        );
      } else {
        // if nothing found clear the results
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const searchDBBySmiles = async (query: string) => {
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
        setSearchResults([
          {
            name: smilesResult.reagent.name ?? undefined,
            smiles: smilesResult.reagent.canonicalSMILES,
            molecularWeight: smilesResult.reagent.molecularWeight,
            density: smilesResult.reagent.density ?? undefined,
          },
        ]);
        setSmilesHelperText("Reagents found in DB by SMILES:");
      } else {
        setSearchResults([]);
        setSmilesHelperText("Nothing found in DB for this query");
      }
    } else {
      // if the user inputs an invalid smiles, the results should be cleared
      // it could be they are trying to search by name now
      setSearchResults([]);
      setSmilesHelperText("Invalid SMILES entered");
    }
  };

  useEffect(() => {
    // reset everything if the input is deleted by user
    if (nameInput === "") {
      setSearchResults([]);
    }

    if (smilesInput === "") {
      setSearchResults([]);
      setSmilesHelperText(undefined);
    }
  }, [nameInput, smilesInput]);

  return (
    <>
      <DialogContent>
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

          <Stack
            alignContent="center"
            justifyContent="center"
            direction="row"
            spacing={3}
          >
            <Button
              variant="contained"
              onClick={() => {
                {
                  /* close this current screen
                   * open the next screen
                   * reset the search results when going to the next screen*/
                }
                setOpenSearchExisting(false);
                setOpenAddNewReagent(true);
                setSearchResults([]);
              }}
            >
              or create new reagent
            </Button>
          </Stack>
          {smilesHelperText ? (
            <Typography>{smilesHelperText}</Typography>
          ) : null}
        </Stack>
      </DialogContent>
    </>
  );
};
