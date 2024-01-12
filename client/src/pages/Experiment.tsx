import { Button, Stack, Typography } from "@mui/material"
import { ReagentTable } from "../components/ReagentTable"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { GetExperimentByIdHandlerResponse } from "../../../server/routes/experiments"

export const ExperimentPage = () => {
    let { id } = useParams()
    const [title, setTitle] = useState<string>()
    const [parentId, setParentId] = useState<number>()

    useEffect(() => {
        const getExperiment = async () => {
            const response = await fetch(`http://localhost:3000/experiments/${id}`)
            const result: GetExperimentByIdHandlerResponse = await response.json()
            if (result.experiment) {
                setTitle(result.experiment.name)
                setParentId(result.experiment.parentId)
            }
        }

        getExperiment()
    }, [])
    return (
        <>
            <Stack padding={2} spacing={1} sx={{ width: '100%' }}>
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                    <Stack>
                        <Button variant="outlined"
                            component={Link}
                            to={`/projects/${parentId}`}>
                            Back
                        </Button>
                    </Stack>
                    <Stack sx={{ width: '90%' }}>
                        <Typography variant="h5" textAlign="center">{title}</Typography>
                    </Stack>
                </Stack >
                <ReagentTable />
            </Stack>
        </>
    )
}
