import { Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material"
import { ReagentTable } from "../components/ReagentTable"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { GetExperimentByIdHandlerResponse } from "../../../server/routes/experiments"

export const ExperimentPage = () => {
    let { id } = useParams()
    const [title, setTitle] = useState<string>()

    useEffect(() => {
        const getExperiment = async () => {
            const response = await fetch(`http://localhost:3000/experiments/${id}`)
            const result: GetExperimentByIdHandlerResponse = await response.json()
            if (result.experiment) {
                setTitle(result.experiment.name)
            }
        }

        getExperiment()
    }, [])
    return (
        <>
            <Stack direction="row" padding={2}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h5" textAlign="center">{title}</Typography>
                    </CardContent>
                    <Divider />
                    <Stack>
                        <Button variant="outlined">
                            Back to project
                        </Button>
                    </Stack>
                </Card >
                <Stack spacing={10} marginRight={2}>
                </Stack>
                <ReagentTable />

            </Stack >
        </>
    )
}
