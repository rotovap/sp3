import { Stack } from "@mui/material"
import MoleculeStructure from "./MoleculeStructure/MoleculeStructure"
import { ExperimentWithReagents } from "../../../server/routes/experiments"

interface Props {
    experiment: ExperimentWithReagents
}

export const ReactionScheme = ({ experiment }: Props) => {
    const width = 75
    const height = 75
    const leftSideReagents = experiment.reagents.filter((i) => i.reactionSchemeLocation === "LEFT_SIDE")
    const rightSideReagents = experiment.reagents.filter((i) => i.reactionSchemeLocation === "RIGHT_SIDE")
    const aboveArrowReagents = experiment.reagents.filter((i) => i.reactionSchemeLocation === "ABOVE_ARROW")
    const belowArrowReagents = experiment.reagents.filter((i) => i.reactionSchemeLocation === "BELOW_ARROW")
    console.log(aboveArrowReagents[0].reagent.canonicalSMILES)
    return (
        <Stack direction="row" padding={2} spacing={1} sx={{ width: '30%' }}>
            {leftSideReagents.map((i) => {
                return (
                    <Stack>
                        <MoleculeStructure
                            id="molecule-structure"
                            structure={i.reagent.canonicalSMILES}
                            width={width}
                            height={height}
                            svgMode
                        />
                    </Stack>
                )
            })}
            {aboveArrowReagents.map((i) => {
                return (
                    <Stack>
                        <MoleculeStructure
                            id="molecule-structure"
                            structure={i.reagent.canonicalSMILES}
                            width={width}
                            height={height}
                            svgMode
                        />
                    </Stack>
                )
            })}
            {belowArrowReagents.map((i) => {
                return (
                    <Stack>
                        <MoleculeStructure
                            id="molecule-structure"
                            structure={i.reagent.canonicalSMILES}
                            width={width}
                            height={height}
                            svgMode
                        />
                    </Stack>
                )
            })}
            {rightSideReagents.map((i) => {
                return (
                    <Stack>
                        <MoleculeStructure
                            id="molecule-structure"
                            structure={i.reagent.canonicalSMILES}
                            width={width}
                            height={height}
                            svgMode
                        />
                    </Stack>
                )
            })}
        </Stack>
    )
}
