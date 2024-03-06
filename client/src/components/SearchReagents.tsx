import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { SearchExistingReagents } from "./SearchExistingReagents";
import { SearchPubChem } from "./SearchPubChem";
import { useState } from "react";
import MoleculeStructure from "./MoleculeStructure/MoleculeStructure";

export interface SearchResult {
  smiles: string;
  name?: string;
  molecularWeight: number;
  density?: number;
}

export const SearchReagents = () => {
  const [openSearchExisting, setOpenSearchExisting] = useState<boolean>(true);
  const [openSearchPubChem, setOpenSearchPubChem] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  return (
    <>
      {openSearchExisting ? (
        <SearchExistingReagents
          setOpenSearchExisting={setOpenSearchExisting}
          setOpenSearchPubChem={setOpenSearchPubChem}
          setSearchResults={setSearchResults}
        />
      ) : null}

      {openSearchPubChem ? (
        <SearchPubChem
          setOpenSearchExisting={setOpenSearchExisting}
          setOpenSearchPubChem={setOpenSearchPubChem}
          setSearchResults={setSearchResults}
        />
      ) : null}

      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Structure</TableCell>
              <TableCell align="right">Name</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {searchResults.map((i) => (
              <TableRow key={i.name} hover={true}>
                <TableCell>
                  <MoleculeStructure
                    id="structure"
                    structure={i.smiles}
                    svgMode
                  />
                </TableCell>
                <TableCell align="right">{i.name}</TableCell>
                <TableCell align="right">
                  <Button variant="contained" onClick={() => console.log(i)}>
                    SELECT
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
