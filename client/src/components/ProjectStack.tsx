import { Link } from "react-router-dom";
import {
  Button,
  ButtonBase,
  Card,
  CardContent,
  Dialog,
  Divider,
  Typography,
} from "@mui/material";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Paper";
import { ProjectWithDataBuffer } from "../../../server/routes/projects";
import { Dispatch, SetStateAction, useState } from "react";
import { CreateEntryDialog } from "./CreateProjectDialog";
import { Experiment } from "@prisma/client";

type BreadCrumbStackProps = { pathToProject: Props["pathToProject"] };

const BreadCrumbStack = ({ pathToProject }: BreadCrumbStackProps) => {
  if (pathToProject) {
    return (
      <Stack marginTop={1} divider={<Divider orientation="horizontal" />}>
        <Typography variant="caption" textAlign="center">
          Back to:
        </Typography>
        {pathToProject.length === 0 ? (
          <ButtonBase component={Link} to={"/"}>
            Project Overview
          </ButtonBase>
        ) : (
          pathToProject.map((i, idx) => {
            return (
              <ButtonBase key={idx} component={Link} to={`/projects/${i.id}`}>
                {i.name}
              </ButtonBase>
            );
          })
        )}
      </Stack>
    );
  }
  return null;
};

interface Props {
  projects: ProjectWithDataBuffer[];
  setProjects: Dispatch<SetStateAction<ProjectWithDataBuffer[]>>;
  title: string;
  pathToProject?: { id: number; name: string }[];
  parentProjectId?: string;
  experiments?: Experiment[];
  setExperiments: Dispatch<SetStateAction<Experiment[]>>;
}

export const ProjectStack = ({
  parentProjectId,
  title,
  projects,
  pathToProject,
  setProjects,
  setExperiments,
  experiments,
}: Props) => {
  const [open, setOpen] = useState(false);

  const openCreateProjectDialog = () => {
    setOpen(true);
  };

  const closeCreateProjectDialog = () => {
    setOpen(false);
  };

  return (
    <>
      <Stack direction="row" padding={2}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h5" textAlign="center">
              {title}
            </Typography>
          </CardContent>
          <Divider />
          <Stack>
            <Button variant="outlined" onClick={openCreateProjectDialog}>
              CREATE NEW
            </Button>
            <BreadCrumbStack pathToProject={pathToProject} />
          </Stack>
        </Card>
        <Stack spacing={10} marginRight={2}></Stack>
        <Stack spacing={1} sx={{ width: "50%" }}>
          {projects.map((i, idx) => {
            return (
              <ButtonBase key={idx} component={Link} to={`/projects/${i.id}`}>
                <Container variant="outlined" sx={{ flexGrow: 1, padding: 2 }}>
                  <Stack direction="row" spacing={10}>
                    <Stack spacing={2}>
                      <Stack>{i.name}</Stack>
                      {/*<Stack>Another info</Stack>*/}
                    </Stack>
                    <Stack>
                      {i.base64image ? (
                        <img
                          src={`data:image/png;base64,${i.base64image}`}
                          alt="image"
                        />
                      ) : null}
                    </Stack>
                  </Stack>
                </Container>
              </ButtonBase>
            );
          })}
          {experiments
            ? experiments.map((i, idx) => {
                return (
                  <ButtonBase
                    key={idx}
                    component={Link}
                    to={`/experiments/${i.id}`}
                  >
                    <Container
                      variant="outlined"
                      sx={{ color: "red", flexGrow: 1, padding: 2 }}
                    >
                      <Stack direction="row" spacing={10}>
                        <Stack spacing={2}>
                          <Stack>{i.name}</Stack>
                          {/*<Stack>Another info</Stack>*/}
                        </Stack>
                        <Stack>
                          Reaction scheme can go here. Make experiments a
                          different style
                        </Stack>
                      </Stack>
                    </Container>
                  </ButtonBase>
                );
              })
            : null}
          {projects.length === 0 && experiments?.length === 0 ? (
            <Container variant="outlined" sx={{ flexGrow: 1, padding: 2 }}>
              No projects or experiments yet
            </Container>
          ) : null}
        </Stack>
      </Stack>
      <Dialog open={open} onClose={closeCreateProjectDialog}>
        <CreateEntryDialog
          parentProjectId={parentProjectId}
          setProjects={setProjects}
          setOpen={setOpen}
          projects={projects}
          setExperiments={setExperiments}
          experiments={experiments}
        />
      </Dialog>
    </>
  );
};
