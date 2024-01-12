import {
  PrismaClient,
  Experiment,
  ReactionSchemeLocation,
  ExperimentReagent,
  Prisma,
} from "@prisma/client";
import { Router } from "express";
import { TypedRequestBody, TypedResponse } from "../types";

export const experimentRoutes = Router();

const prisma = new PrismaClient();

export interface CreateExperimentHandlerRequest {
  name: string;
  parentId: string;
}

export interface CreateExperimentHandlerResponse {
  experiment: Experiment;
}

export const createExperimentHandler = async (
  req: TypedRequestBody<CreateExperimentHandlerRequest>,
  res: TypedResponse<CreateExperimentHandlerResponse>,
) => {
  const { name, parentId } = req.body;

  try {
    const experiment = await prisma.experiment.create({
      data: {
        name: name,
        parentId: Number(parentId),
      },
    });
    res.json({ experiment: experiment });
  } catch (e) {
    return res.status(500).send(JSON.stringify(`Error: ${e}`));
  }
};

export interface AssignReagentToExperimentHandlerRequest {
  experimentId: string;
  reagentId: string;
  reactionSchemeLocation: ReactionSchemeLocation;
  equivalents: number;
}

export interface AssignReagentToExperimentHandlerResponse {
  experiment: Experiment & { reagents: ExperimentReagent[] };
}

// assign reagent to the experiment
// reagent needs to already be in the DB
export const assignReagentToExperiment = async (
  req: TypedRequestBody<AssignReagentToExperimentHandlerRequest>,
  res: TypedResponse<AssignReagentToExperimentHandlerResponse>,
) => {
  const { experimentId, reagentId, reactionSchemeLocation, equivalents } =
    req.body;
  try {
    const result = await prisma.experimentReagent.create({
      data: {
        reagentId: Number(reagentId),
        experimentId: Number(experimentId),
        reactionSchemeLocation: reactionSchemeLocation,
        equivalents: equivalents,
      },
      include: { experiment: { include: { reagents: true } } },
    });

    res.json({ experiment: result.experiment });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2003") {
        return res
          .status(404)
          .send(JSON.stringify(`Reagent not in DB: ${e.message}`));
      }
      if (e.code === "P2002") {
        return res
          .status(400)
          .send(
            JSON.stringify(
              `Reagent ${reagentId} already assigned to experiment ${experimentId}`,
            ),
          );
      }
    }
    return res.status(500).send(JSON.stringify(`Error: ${e}`));
  }
};

export interface GetExperimentByIdHandlerRequest {
  id: string;
}

export type ExperimentWithReagents = Prisma.ExperimentGetPayload<{
  include: { reagents: { include: { reagent: true } } };
}>;
export interface GetExperimentByIdHandlerResponse {
  experiment: ExperimentWithReagents | null;
}

export const getExperimentByIdHandler = async (
  req: TypedRequestBody<GetExperimentByIdHandlerRequest>,
  res: TypedResponse<GetExperimentByIdHandlerResponse>,
) => {
  try {
    const result = await prisma.experiment.findUnique({
      where: { id: Number(req.params.id) },
      include: { reagents: { include: { reagent: true } } },
    });
    return res.json({ experiment: result });
  } catch (e) {
    return res.status(500).send(JSON.stringify(`Error: ${e}`));
  }
};

experimentRoutes.post("/", createExperimentHandler);
experimentRoutes.post("/assignReagentToExperiment", assignReagentToExperiment);
experimentRoutes.get("/:id", getExperimentByIdHandler);
