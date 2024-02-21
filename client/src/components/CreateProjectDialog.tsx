import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Dispatch, SetStateAction, SyntheticEvent, useState } from "react";
import {
  CreateProjectHandlerRequest,
  CreateProjectHandlerResponse,
  ProjectWithDataBuffer,
} from "../../../server/routes/projects";
import { CreateExperimentHandlerResponse } from "../../../server/routes/experiments";
import { Experiment } from "@prisma/client";

type EntryTypeOptions = "PROJECT" | "EXPERIMENT";

interface EntryFormProps {
  type: EntryTypeOptions;
  parentProjectId?: string;
  // this needs to be passed up to the project stack to render the newly added project or experiment
  setProjects: Dispatch<SetStateAction<ProjectWithDataBuffer[]>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  projects: ProjectWithDataBuffer[];
  experiments?: Experiment[];
  setExperiments: Dispatch<SetStateAction<Experiment[]>>;
}
const EntryForm = ({
  type,
  parentProjectId,
  setProjects,
  projects,
  setOpen,
  experiments,
  setExperiments,
}: EntryFormProps) => {
  const [projectName, setProjectName] = useState("");
  const [file, setFile] = useState<File>();

  const handleClearFile = (event: SyntheticEvent) => {
    event.preventDefault();
    setFile(undefined);
  };

  const handleNameOnChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setProjectName(event.target.value);
  };

  const handleFileUploadChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = (event.target as HTMLInputElement).files;
    if (files && files[0]) {
      setFile(() => files[0]);
    }
  };

  const handleSubmitExperiment = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    try {
      const exptToAdd = {
        name: projectName,
        parentId: parentProjectId,
      };

      const response = await fetch(`http://localhost:3000/experiments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exptToAdd),
      });
      const newExpt: CreateExperimentHandlerResponse = await response.json();
      // set a experiment array
      if (experiments) {
        const newExperiments = [...experiments, newExpt.experiment];
        setExperiments(newExperiments);
      } else {
        setExperiments([newExpt.experiment]);
      }

      setOpen(false);
      setFile(undefined);
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const handleSubmitProject = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const url = "http://localhost:3000/projects/";
    const formData = new FormData();

    const bodyFieldsForAddingProject: CreateProjectHandlerRequest = {
      name: projectName,
      parentId: parentProjectId ?? undefined,
    };

    if (file) {
      formData.append(
        "projectImage",
        new Blob([file], { type: "application/octet-stream" }),
      );
    }

    for (const [key, value] of Object.entries(bodyFieldsForAddingProject)) {
      formData.append(key, value);
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const newProject: CreateProjectHandlerResponse = await response.json();
      const newP = [...projects, newProject.project];
      setProjects(newP);
      setOpen(false);
      setFile(undefined);
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  return (
    <>
      <form
        onSubmit={
          type === "EXPERIMENT" ? handleSubmitExperiment : handleSubmitProject
        }
      >
        <DialogTitle>
          Create a new {type === "EXPERIMENT" ? "experiment" : "project"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label={`${type === "EXPERIMENT" ? "Experiment" : "Project"} name`}
            autoFocus
            margin="normal"
            id={`${type}-name`}
            fullWidth
            variant="standard"
            onChange={(event) => {
              handleNameOnChange(event);
            }}
          />
          {type === "PROJECT" ? (
            <>
              <Button component="label" variant="contained">
                {file ? (
                  <Button variant="contained" onClick={handleClearFile}>
                    Clear attachment
                  </Button>
                ) : (
                  "Attach reaction scheme or image"
                )}
                <input type="file" hidden onChange={handleFileUploadChange} />
              </Button>
              <>{file?.name}</>
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" type="submit">
            Create {type === "EXPERIMENT" ? "Experiment" : "Project"}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

interface Props {
  parentProjectId?: string;
  setProjects: Dispatch<SetStateAction<ProjectWithDataBuffer[]>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  projects: ProjectWithDataBuffer[];
  setExperiments: Dispatch<SetStateAction<Experiment[]>>;
  experiments?: Experiment[];
}

export const CreateEntryDialog = ({
  parentProjectId,
  setProjects,
  projects,
  setOpen,
  experiments,
  setExperiments,
}: Props) => {
  const [type, setType] = useState<EntryTypeOptions>("PROJECT");

  const handleTypeToggle = (
    _: React.MouseEvent<HTMLElement>,
    newInput: EntryTypeOptions | null,
  ) => {
    if (newInput !== null) {
      setType(newInput);
    }
  };

  return (
    <>
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
      <EntryForm
        type={type}
        parentProjectId={parentProjectId}
        setProjects={setProjects}
        projects={projects}
        setOpen={setOpen}
        experiments={experiments}
        setExperiments={setExperiments}
      />
    </>
  );
};
