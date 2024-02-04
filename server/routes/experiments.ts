import {
  PrismaClient,
  Experiment,
  ReactionSchemeLocation,
  ExperimentReagent,
  Prisma,
  Reagent,
  AmtPlannedUnit,
} from "@prisma/client";
import { Router } from "express";
import { TypedRequestBody, TypedResponse } from "../types";
import { isSomeEnum } from "../utils";

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
  limitingReagent: boolean;
  amountPlannedInGrams: number;
  amountPlannedUnit: string;
}

export interface AssignReagentToExperimentHandlerResponse {
  experiment: Experiment & { reagents: ExperimentReagent[] };
}

type FullExperimentReagent = Prisma.ExperimentReagentGetPayload<{
  include: { experiment: { include: { reagents: true } } };
}>;
// move the transaction out of the handler because typescript seems to take the
// return type of the handler as the return type of the transaction, which is
// incorrect
const _assignExperimentReagent = async ({
  experimentId,
  reagentId,
  reactionSchemeLocation,
  limitingReagent,
  equivalents,
  amountPlannedInGrams,
  amountPlannedUnit,
}: AssignReagentToExperimentHandlerRequest): Promise<FullExperimentReagent> => {
  const txRes = await prisma.$transaction(async (tx) => {
    // should only be one limiting reagent in the experiment
    const reagents = await tx.experimentReagent.findMany({
      where: {
        experimentId: Number(experimentId),
      },
      include: { reagent: true },
    });

    const existingLimitingReagent = reagents.find(
      (i) => i.limitingReagent === true,
    );

    if (limitingReagent && existingLimitingReagent) {
      throw new Error(
        `Experiment ${experimentId} already has a limiting reagent: ${existingLimitingReagent.reagent.name}`,
      );
    }
    const unit = amountPlannedUnit.toUpperCase();
    if (isSomeEnum(AmtPlannedUnit)(unit)) {
      const result = await tx.experimentReagent.create({
        data: {
          reagentId: Number(reagentId),
          experimentId: Number(experimentId),
          reactionSchemeLocation: reactionSchemeLocation,
          equivalents: equivalents,
          limitingReagent: limitingReagent,
          amountPlannedInGrams: amountPlannedInGrams,
          amountPlannedUnit: unit,
        },
        include: { experiment: { include: { reagents: true } } },
      });

      return result;
    } else {
      throw new Error(
        `The amountPlannedUnit ${amountPlannedUnit} is not a part of the allowed units`,
      );
    }
  });
  return txRes;
};

// assign reagent to the experiment
// reagent needs to already be in the DB
export const assignReagentToExperiment = async (
  req: TypedRequestBody<AssignReagentToExperimentHandlerRequest>,
  res: TypedResponse<AssignReagentToExperimentHandlerResponse>,
) => {
  const {
    experimentId,
    reagentId,
    reactionSchemeLocation,
    equivalents,
    limitingReagent,
    amountPlannedInGrams,
    amountPlannedUnit,
  } = req.body;

  try {
    const txRes = await _assignExperimentReagent({
      experimentId: experimentId,
      reagentId: reagentId,
      reactionSchemeLocation: reactionSchemeLocation,
      equivalents: equivalents,
      limitingReagent: limitingReagent,
      amountPlannedInGrams: amountPlannedInGrams,
      amountPlannedUnit: amountPlannedUnit,
    });
    return res.json({ experiment: txRes.experiment });
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
    return res.status(500).send(JSON.stringify(`${e}`));
  }
};

export interface GetExperimentByIdHandlerRequest {
  id: string;
}

export type ReagentWithSMILES = Reagent & { canonicalSMILES: string };
export type ReagentInExperiment = ExperimentReagent & {
  reagent: ReagentWithSMILES;
};
export type ExperimentWithReagents = Experiment & {
  reagents: ReagentInExperiment[];
};
export interface GetExperimentByIdHandlerResponse {
  experiment: ExperimentWithReagents | null;
}

interface RawExperimentQueryResult {
  id: number;
  name: string;
  parentId: number;
  erId: number;
  erExperimentId: number;
  amountPlannedInGrams: number;
  amountPlannedUnit: AmtPlannedUnit;
  reactionSchemeLocation: ReactionSchemeLocation;
  erReagentId: number;
  equivalents: number;
  limitingReagent: boolean;
  rId: number;
  rName: string;
  canonicalSMILES: string;
  density: number;
  molecularWeight: number;
}

export const getExperimentByIdHandler = async (
  req: TypedRequestBody<GetExperimentByIdHandlerRequest>,
  res: TypedResponse<GetExperimentByIdHandlerResponse>,
) => {
  try {
    // considered writing a separate handler to get the smiles of reagents,
    // in order to do the bulk of the query in prisma, and use its type
    // generation
    const rawResult = await prisma.$queryRaw<RawExperimentQueryResult[]>`
        SELECT e.id,
            e.name,
            e."parentId",
            er.id AS "erId", 
            er."experimentId" AS "erExperimentId",
            er."reactionSchemeLocation",
            er."reagentId" AS "erReagentId",
            er.equivalents,
            er."limitingReagent",
            er."amountPlannedInGrams", 
            er."amountPlannedUnit",
            r.id AS "rId",
            r.name AS "rName",
            r."canonicalSMILES"::text,
            r.density,
            r."molecularWeight"
        FROM "Experiment" e
        LEFT OUTER JOIN "ExperimentReagent" er 
        ON e.id=er."experimentId"
        LEFT OUTER JOIN "Reagent" r
        ON r.id=er."reagentId"
        WHERE e.id=${Number(req.params.id)}
    `;

    if (rawResult.length > 0) {
      const result = {
        id: rawResult[0].id,
        name: rawResult[0].name,
        parentId: rawResult[0].parentId,
        reagents: rawResult
          .filter((i) => i.erId !== null)
          .map((i) => {
            // each of these is a row from "ExperimentReagent"
            {
              return {
                id: i.erId,
                experimentId: i.erExperimentId,
                equivalents: i.equivalents,
                limitingReagent: i.limitingReagent,
                reactionSchemeLocation: i.reactionSchemeLocation,
                reagentId: i.rId,
                amountPlannedInGrams: i.amountPlannedInGrams,
                amountPlannedUnit: i.amountPlannedUnit,
                reagent: {
                  id: i.rId,
                  density: i.density,
                  molecularWeight: i.molecularWeight,
                  name: i.rName,
                  canonicalSMILES: i.canonicalSMILES,
                },
              };
            }
          }),
      };
      return res.json({ experiment: result });
    }
    return res.json({ experiment: null });
  } catch (e) {
    return res.status(500).send(JSON.stringify(`Error: ${e}`));
  }
};

experimentRoutes.post("/", createExperimentHandler);
experimentRoutes.post("/assignReagentToExperiment", assignReagentToExperiment);
experimentRoutes.get("/:id", getExperimentByIdHandler);
