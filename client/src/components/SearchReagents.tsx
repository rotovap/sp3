import { DialogContentText, Stack, Typography } from "@mui/material";
import { SearchExistingReagents } from "./SearchExistingReagents";
import { Dispatch, SetStateAction, useState } from "react";
import { SearchResultsTable } from "./SearchResultsTable";

export interface SearchResult {
  smiles: string;
  name?: string;
  molecularWeight: number;
  density?: number;
}

interface Props {
  setOpenSearchExisting: Dispatch<SetStateAction<boolean>>;
  setOpenAddNewReagent: Dispatch<SetStateAction<boolean>>;
  openSearchExisting: boolean;
}

export const SearchReagents = ({
  setOpenSearchExisting,
  setOpenAddNewReagent,
}: Props) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  return (
    <>
      <DialogContentText>
        <Typography component={"span"} variant="body2">
          Search your database or PubChem for a reagent.
        </Typography>
      </DialogContentText>
      <Stack spacing={4}>
        <SearchExistingReagents
          setOpenSearchExisting={setOpenSearchExisting}
          setOpenAddNewReagent={setOpenAddNewReagent}
          setSearchResults={setSearchResults}
        />

        <SearchResultsTable searchResults={searchResults} />
      </Stack>
    </>
  );
};
