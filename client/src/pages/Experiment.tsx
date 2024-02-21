import { Button, Stack, Typography } from "@mui/material";
import { ReagentTable } from "../components/ReagentTable";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ExperimentWithReagents,
  GetExperimentByIdHandlerResponse,
} from "../../../server/routes/experiments";
import { ReactionScheme } from "../components/ReactionScheme";

interface TitleBarProps {
  experiment: ExperimentWithReagents;
}
const TitleBar = ({ experiment }: TitleBarProps) => {
  return (
    <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
      <Stack>
        <Button
          variant="outlined"
          component={Link}
          to={`/projects/${experiment.parentId}`}
        >
          Back
        </Button>
      </Stack>
      <Stack sx={{ width: "90%" }}>
        <Typography variant="h5" textAlign="center">
          {experiment.name}
        </Typography>
      </Stack>
    </Stack>
  );
};
export const ExperimentPage = () => {
  let { id } = useParams();
  const [experiment, setExperiment] = useState<ExperimentWithReagents>();
  // this state is used to rerender the reagent table after adding a new
  // reagent. In order to get the table to re-render, a way to trigger
  // the hook is needed. Just tracking what reagentIds are present and adding
  // to this array any newly assigned reagents makes the useEffect hook run
  // again and then refetches the updated experiments and then re-renders the
  // reagent table
  const [addedReagentIds, setAddedReagentIds] = useState<number[]>([]);

  useEffect(() => {
    const getExperiment = async () => {
      const response = await fetch(`http://localhost:3000/experiments/${id}`);
      const result: GetExperimentByIdHandlerResponse = await response.json();
      if (result.experiment) {
        setExperiment(result.experiment);
      }
    };

    getExperiment();
  }, [addedReagentIds]);

  return (
    <>
      {experiment ? (
        <Stack padding={2} spacing={1} sx={{ width: "100%" }}>
          <TitleBar experiment={experiment} />
          <ReactionScheme experiment={experiment} />
          <ReagentTable
            experiment={experiment}
            setAddedReagentIds={setAddedReagentIds}
          />
        </Stack>
      ) : null}
    </>
  );
};
