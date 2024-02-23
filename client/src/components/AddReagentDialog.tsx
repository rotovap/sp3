import {
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
import { GetSimilarReagentsByNameHandlerResponse } from "../../../server/routes/reagents";

export const AddReagentDialog = () => {
  const [input, setInput] = useState<string>();
  const [queryResults, setQueryResults] =
    useState<GetSimilarReagentsByNameHandlerResponse>();

  const searchReagents = async (query: string) => {
    if (query !== "") {
      const response = await fetch(
        `http://localhost:3000/reagents/getSimilarReagentsByName?name=${query}`,
      );
      const result: GetSimilarReagentsByNameHandlerResponse =
        await response.json();
      if (result.reagents) {
        setQueryResults(result);
      }
    } else {
      setQueryResults(undefined);
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
          label={"Name or SMILES"}
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

        {queryResults ? (
          <List>
            <Typography>Reagents found by name: </Typography>
            {queryResults.reagents.map((i) => (
              <ListItemButton>
                <ListItemText>{i.name}</ListItemText>
              </ListItemButton>
            ))}
          </List>
        ) : null}
      </DialogContent>
    </>
  );
};
