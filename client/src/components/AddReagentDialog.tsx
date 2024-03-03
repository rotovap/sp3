import {
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { SearchReagents } from "./SearchReagents";

// TODO: refactor into individual components search by name, by smiles, and pubchem
// I think they are still too linked

export const AddReagentDialog = () => {
  return (
    <>
      <DialogTitle>Add Reagent</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography component={"span"} variant="body2">
            Search your database or PubChem for a reagent.
          </Typography>
        </DialogContentText>
        <SearchReagents />
      </DialogContent>
    </>
  );
};
