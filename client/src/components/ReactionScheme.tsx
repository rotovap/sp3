import { Grid, Stack, Typography } from "@mui/material";
import MoleculeStructure from "./MoleculeStructure/MoleculeStructure";
import {
  ExperimentWithReagents,
  ReagentWithSMILES,
} from "../../../server/routes/experiments";
import { ArcherContainer, ArcherElement } from "react-archer";

interface Props {
  experiment: ExperimentWithReagents;
}

const MOL_STRUCT_DIM = 100;

interface LeftAndRightSideProps {
  reagent: ReagentWithSMILES;
  idx: number;
  lengthOfReagents: number;
}
// left and right side of the reaction scheme show structures and may have
// + signs. They are similar
const LeftAndRightSide = ({
  reagent,
  idx,
  lengthOfReagents,
}: LeftAndRightSideProps) => {
  return (
    <Stack direction="row" key={reagent.id}>
      {/* this grid is to help align the items in the stack 
                        so that the + sign height is in the middle of the 
                        molecules */}
      <Grid
        container
        spacing={0}
        direction="row"
        alignItems="center"
        justifyContent="center"
      >
        <Stack padding={3} direction="column" textAlign="center">
          <MoleculeStructure
            id="molecule-structure"
            structure={reagent.canonicalSMILES}
            width={MOL_STRUCT_DIM}
            height={MOL_STRUCT_DIM}
            svgMode
          />
          <Typography variant="caption" display="block" gutterBottom>
            {reagent.id}
          </Typography>
        </Stack>
        {idx < lengthOfReagents - 1 ? <Stack>+</Stack> : null}
      </Grid>
    </Stack>
  );
};

export const ReactionScheme = ({ experiment }: Props) => {
  const REACTION_ARROW_MARGIN_LEFT = 3;
  const leftSideReagents = experiment.reagents.filter(
    (i) => i.reactionSchemeLocation === "LEFT_SIDE",
  );
  const rightSideReagents = experiment.reagents.filter(
    (i) => i.reactionSchemeLocation === "RIGHT_SIDE",
  );
  const aboveArrowReagents = experiment.reagents.filter(
    (i) => i.reactionSchemeLocation === "ABOVE_ARROW",
  );
  const belowArrowReagents = experiment.reagents.filter(
    (i) => i.reactionSchemeLocation === "BELOW_ARROW",
  );
  const boxStyle = { padding: "10px" };
  return (
    <>
      <ArcherContainer>
        <Grid
          container
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          {leftSideReagents.map((i, idx) => {
            return (
              <div key={i.reagentId}>
                {/* draw the arrow between the last left side reagent and the first right side reagent*/}
                {idx === leftSideReagents.length - 1 ? (
                  <ArcherElement
                    id={`left-side-${idx}`}
                    relations={[
                      {
                        targetId: `right-side-0`,
                        targetAnchor: "left",
                        sourceAnchor: "right",
                        style: { strokeColor: "black", strokeWidth: 1 },
                      },
                    ]}
                  >
                    <div style={boxStyle}>
                      <LeftAndRightSide
                        idx={idx}
                        reagent={i.reagent}
                        lengthOfReagents={leftSideReagents.length}
                      />
                    </div>
                  </ArcherElement>
                ) : (
                  <LeftAndRightSide
                    idx={idx}
                    reagent={i.reagent}
                    lengthOfReagents={leftSideReagents.length}
                  />
                )}
              </div>
            );
          })}
          <Stack spacing={3}>
            <Stack spacing={0}>
              {aboveArrowReagents.map((i) => {
                return (
                  <Stack
                    key={i.reagentId}
                    marginLeft={REACTION_ARROW_MARGIN_LEFT}
                  >
                    <Typography variant="caption" display="block" gutterBottom>
                      {i.reagent.name}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
            <Stack paddingTop={2} spacing={0}>
              {belowArrowReagents.map((i) => {
                return (
                  <Stack
                    key={i.reagentId}
                    marginLeft={REACTION_ARROW_MARGIN_LEFT}
                  >
                    <Typography variant="caption" display="block" gutterBottom>
                      {i.reagent.name}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
          {rightSideReagents.map((i, idx) => {
            return (
              <div key={i.reagentId}>
                {idx === 0 ? (
                  <ArcherElement id={`right-side-0`}>
                    <div style={boxStyle}>
                      <LeftAndRightSide
                        idx={i.reagentId}
                        reagent={i.reagent}
                        lengthOfReagents={rightSideReagents.length}
                      />
                    </div>
                  </ArcherElement>
                ) : (
                  <LeftAndRightSide
                    idx={idx}
                    reagent={i.reagent}
                    lengthOfReagents={rightSideReagents.length}
                  />
                )}
              </div>
            );
          })}
        </Grid>
      </ArcherContainer>
    </>
  );
};
