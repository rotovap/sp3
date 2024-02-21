import { Dispatch, SetStateAction, useState } from "react";
import { AddReagentDialog } from "./AddReagentDialog";
import {
  Button,
  Dialog,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { ExperimentWithReagents } from "../../../server/routes/experiments";
import SpeedIcon from "@mui/icons-material/Speed";
import { calculateMmolOfLimitingReagent } from "../utils";

interface Props {
  experiment: ExperimentWithReagents;
  setAddedReagentIds: Dispatch<SetStateAction<number[]>>;
}
export const ReagentTable = ({ experiment, setAddedReagentIds }: Props) => {
  const [open, setOpen] = useState(false);

  const openAddReagentDialog = () => {
    setOpen(true);
  };

  const closeAddReagentDialog = () => {
    setOpen(false);
  };

  const lr = experiment.reagents.find((i) => i.limitingReagent);

  if (lr?.amountPlannedInGrams) {
  }

  const lrMmol = lr?.amountPlannedInGrams
    ? calculateMmolOfLimitingReagent(
        lr.amountPlannedInGrams,
        lr?.reagent.molecularWeight,
      )
    : null;
  // TODO: calculate mmol - need first to be able to add the desired amount of limiting reagent
  return (
    <>
      <Stack>
        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell align="right">Name</TableCell>
                <TableCell align="right">MW (g/mol)</TableCell>
                <TableCell align="right">Density</TableCell>
                <TableCell align="right">mmol</TableCell>
                <TableCell align="right">Eq</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* show limiting reagent first */}
              {lr ? (
                <TableRow>
                  <TableCell>
                    <Tooltip title="Limiting reagent">
                      <SpeedIcon fontSize="small" />
                    </Tooltip>
                    {lr.reagent.id}
                  </TableCell>
                  <TableCell align="right">{lr.reagent.name}</TableCell>
                  <TableCell align="right">
                    {lr.reagent.molecularWeight}
                  </TableCell>
                  <TableCell align="right">
                    {lr.reagent.density ?? "--"}
                  </TableCell>
                  <TableCell align="right">{lrMmol}</TableCell>
                  <TableCell align="right">{lr.equivalents}</TableCell>
                  <TableCell align="right">{lr.amountPlannedInGrams}</TableCell>
                </TableRow>
              ) : null}
              {experiment.reagents.map((i, idx) => {
                if (
                  i.reactionSchemeLocation !== "RIGHT_SIDE" &&
                  !i.limitingReagent
                ) {
                  const { name, molecularWeight, density } = i.reagent;
                  return (
                    <TableRow key={idx}>
                      <TableCell>{i.reagent.id}</TableCell>
                      <TableCell align="right">{name}</TableCell>
                      <TableCell align="right">{molecularWeight}</TableCell>
                      <TableCell align="right">{density ?? "--"}</TableCell>
                      <TableCell align="right">{}</TableCell>
                      <TableCell align="right">{i.equivalents}</TableCell>
                      <TableCell align="right">1g</TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Button variant="outlined" onClick={openAddReagentDialog}>
          ADD REAGENT
        </Button>
      </Stack>
      <Dialog
        open={open}
        onClose={closeAddReagentDialog}
        fullWidth={true}
        maxWidth="xl"
      >
        <AddReagentDialog
          experiment={experiment}
          setOpen={setOpen}
          setAddedReagentIds={setAddedReagentIds}
        />
      </Dialog>
    </>
  );
};
