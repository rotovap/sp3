import { useState } from "react"
import { AddReagentDialog } from "./AddReagentDialog"
import { Button, Dialog, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material"
import { ExperimentWithReagents } from "../../../server/routes/experiments"
import SpeedIcon from '@mui/icons-material/Speed';

interface Props {
    experiment: ExperimentWithReagents
}
export const ReagentTable = ({ experiment }: Props) => {
    const [open, setOpen] = useState(false)

    const openAddReagentDialog = () => {
        setOpen(true)
    }

    const closeAddReagentDialog = () => {
        setOpen(false)
    }


    // FIX: reagent table doesn't automatically rerender after a reagent is added
    // TODO: maybe try make the assing reagent experiment api happen here in the parent
    // so that the component rerenders and draws the new structure that was added
    // TODO: sort the reagents so that limiting reagent is first, then the left side, then above arrow, then below arrow
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
                            {experiment.reagents.map((i, idx) => {
                                if (i.reactionSchemeLocation !== "RIGHT_SIDE") {
                                    const { name, molecularWeight, density } = i.reagent
                                    return (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                {i.limitingReagent ?
                                                    <Tooltip title="Limiting reagent">
                                                        <SpeedIcon fontSize="small" />
                                                    </Tooltip>
                                                    : null
                                                }
                                                {i.reagent.id}
                                            </TableCell>
                                            <TableCell align="right">{name}</TableCell>
                                            <TableCell align="right">{molecularWeight}</TableCell>
                                            <TableCell align="right">{density ?? '--'}</TableCell>
                                            <TableCell align="right">mmol</TableCell>
                                            <TableCell align="right">{i.equivalents}</TableCell>
                                            <TableCell align="right">1g</TableCell>
                                        </TableRow>
                                    )
                                }
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button variant="outlined"
                    onClick={openAddReagentDialog}>
                    ADD REAGENT
                </Button>
            </Stack >
            <Dialog
                open={open}
                onClose={closeAddReagentDialog}
                fullWidth={true}
                maxWidth='xl'
            >
                <AddReagentDialog experiment={experiment} setOpen={setOpen} />
            </Dialog>
        </>

    )
}
