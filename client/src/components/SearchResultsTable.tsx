import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Button,
} from "@mui/material";
import { SearchResult } from "./SearchReagents";
import MoleculeStructure from "./MoleculeStructure/MoleculeStructure";

interface Props {
  searchResults: SearchResult[];
}
export const SearchResultsTable = ({ searchResults }: Props) => {
  return (
    <>
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
