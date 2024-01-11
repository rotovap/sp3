import { Button, DialogActions, DialogContent, DialogTitle, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { Dispatch, SetStateAction, SyntheticEvent, useState } from "react";
import { CreateProjectHandlerRequest, CreateProjectHandlerResponse, ProjectWithDataBuffer } from "../../../server/routes/projects";

interface Props {
    parentProjectId?: string
    setProjects: Dispatch<SetStateAction<ProjectWithDataBuffer[]>>
    setOpen: Dispatch<SetStateAction<boolean>>
    projects: ProjectWithDataBuffer[]
}

type Options = "PROJECT" | "EXPERIMENT"

export const CreateProjectDialog = ({ parentProjectId, setProjects, projects, setOpen }: Props) => {
    const [file, setFile] = useState<File>()
    const [type, setType] = useState<Options>()
    const [projectName, setProjectName] = useState('')

    const handleTypeToggle = (_: React.MouseEvent<HTMLElement>, newInput: Options | null) => {
        if (newInput !== null) {
            setType(newInput)
        }
    }

    const handleNameOnChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProjectName(event.target.value)
    }

    const handleFileUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = (event.target as HTMLInputElement).files
        if (files && files[0]) {
            setFile(() => files[0])
        }
    }

    const handleClearFile = (event: SyntheticEvent) => {
        event.preventDefault()
        setFile(undefined)
    }

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        const url = 'http://localhost:3000/projects/'
        const formData = new FormData()

        const bodyFieldsForAddingProject: CreateProjectHandlerRequest = {
            name: projectName,
            parentId: parentProjectId ?? undefined
        }

        if (file) {
            formData.append('projectImage',
                new Blob(
                    [file], { type: 'application/octet-stream' }
                ))

        }

        for (const [key, value] of Object.entries(bodyFieldsForAddingProject)) {
            formData.append(key, value)
        }


        try {
            const response = await fetch(url, {
                method: "POST",
                body: formData
            })
            const newProject: CreateProjectHandlerResponse = await response.json()
            const newP = [...projects, newProject.project]
            setProjects(newP)
            setOpen(false)
            setFile(undefined)
        } catch (error) {
            console.error("Error: ", error)
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <ToggleButtonGroup
                    value={type}
                    exclusive
                    onChange={handleTypeToggle}
                    aria-label="project-or-experiment"
                >
                    <ToggleButton value="PROJECT" aria-label="Project">
                        PROJECT
                    </ToggleButton>
                    <ToggleButton value="EXPERIMENT" aria-label="Experiment">
                        EXPERIMENT
                    </ToggleButton>
                </ToggleButtonGroup>
                <DialogTitle>
                    Create a new {type === "EXPERIMENT" ? "experiment" : "project"}
                </DialogTitle>
                <DialogContent>
                    <TextField label="Project name"
                        autoFocus
                        margin="normal"
                        id="project-name"
                        fullWidth
                        variant="standard"
                        onChange={(event) => {
                            handleNameOnChange(event)
                        }} />
                    <Button component="label" variant="contained">
                        {file ?
                            <Button variant="contained"
                                onClick={handleClearFile}>
                                Clear attachment
                            </Button>
                            : 'Attach reaction scheme'}
                        <input type="file"
                            hidden
                            onChange={handleFileUploadChange}
                        />
                    </Button>
                    <>{file}</>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" type="submit">Create project</Button>
                </DialogActions>
            </form>
        </>
    )
} 
