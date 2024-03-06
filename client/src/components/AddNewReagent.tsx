import {
  Button,
  DialogContent,
  DialogContentText,
  Stack,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { SearchPubChem } from "./SearchPubChem";
import { SearchResult } from "./SearchReagents";
import { SearchResultsTable } from "./SearchResultsTable";

interface Props {
  setOpenAddNewReagent: Dispatch<SetStateAction<boolean>>;
  setOpenSearchExisting: Dispatch<SetStateAction<boolean>>;
}

// search pubchem or create a new reagent from scratch
export const AddNewReagent = ({
  setOpenSearchExisting,
  setOpenAddNewReagent,
}: Props) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  return (
    <>
      <DialogContent>
        <DialogContentText>
          <Typography component={"span"} variant="body2">
            Add a new reagent to the database
          </Typography>
        </DialogContentText>
        <Button
          variant="contained"
          onClick={() => {
            setOpenSearchExisting(true);
            setOpenAddNewReagent(false);
            setSearchResults([]);
          }}
        >
          Back
        </Button>
        <Stack spacing={4}>
          <SearchPubChem setSearchResults={setSearchResults} />
          <SearchResultsTable searchResults={searchResults} />
        </Stack>
      </DialogContent>
    </>
  );
};
