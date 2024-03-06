import { DialogContent, DialogTitle } from "@mui/material";
import { AddNewReagent } from "./AddNewReagent";
import { SearchReagents } from "./SearchReagents";
import { useState } from "react";

// starts by searching or adding a new reagent to the DB
export const AddReagentDialog = () => {
  const [openSearchExisting, setOpenSearchExisting] = useState<boolean>(true);
  const [openAddNewReagent, setOpenAddNewReagent] = useState<boolean>(false);
  return (
    <>
      <DialogTitle>Add Reagent</DialogTitle>
      <DialogContent>
        {openSearchExisting ? (
          <SearchReagents
            openSearchExisting={openSearchExisting}
            setOpenSearchExisting={setOpenSearchExisting}
            setOpenAddNewReagent={setOpenAddNewReagent}
          />
        ) : null}

        {openAddNewReagent ? (
          <AddNewReagent
            setOpenSearchExisting={setOpenSearchExisting}
            setOpenAddNewReagent={setOpenAddNewReagent}
          />
        ) : null}
      </DialogContent>
    </>
  );
};
