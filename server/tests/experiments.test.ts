import { server } from "../index";
import {
  AmtPlannedUnit,
  ExperimentReagent,
  PrismaClient,
  ReactionSchemeLocation,
} from "@prisma/client";
import { resetDB, runSeedForTests } from "../../prisma/seed";
import {
  test,
  afterEach,
  beforeEach,
  describe,
  expect,
  afterAll,
} from "@jest/globals";
import {
  AssignReagentToExperimentHandlerRequest,
  AssignReagentToExperimentHandlerResponse,
  CreateExperimentHandlerRequest,
  GetExperimentByIdHandlerResponse,
} from "../routes/experiments";
import supertest from "supertest";

export type SupertestResponse<T> = Omit<Response, "body"> & { body: T };
const prisma = new PrismaClient();

describe("experiments routes", () => {
  beforeEach(async () => {
    await resetDB();
    await runSeedForTests();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  afterAll(() => {
    server.close();
  });

  describe("POST /experiments", () => {
    test("creates a new experiment", async () => {
      const payload: CreateExperimentHandlerRequest = {
        name: "test experiment",
        parentId: "1",
      };
      const result = await supertest(server).post("/experiments").send(payload);
      const expectedResult = {
        experiment: {
          id: 4,
          name: "test experiment",
          parentId: 1,
        },
      };

      expect(result.body).toStrictEqual(expectedResult);
    });
  });

  describe("POST /assignReagentToExperiment", () => {
    function compareExptReagent(
      a: ExperimentReagent,
      b: ExperimentReagent,
    ): number {
      if (a.id < b.id) {
        return 1;
      } else if (a.id > b.id) {
        return -1;
      } else {
        return 0;
      }
    }
    test("assigns a reagent to experiment", async () => {
      const payload: AssignReagentToExperimentHandlerRequest = {
        experimentId: "1",
        reagentId: "1",
        reactionSchemeLocation: "LEFT_SIDE",
        equivalents: 1,
        limitingReagent: true,
        amountPlannedInGrams: 10,
        amountPlannedUnit: "G",
      };

      const result = await supertest(server)
        .post("/experiments/assignReagentToExperiment")
        .send(payload);

      const expectedResult = {
        experiment: {
          id: 1,
          name: "01012024-random reaction",
          parentId: 4,
          reagents: [
            {
              id: 1,
              reagentId: 2,
              reactionSchemeLocation: ReactionSchemeLocation.ABOVE_ARROW,
              experimentId: 1,
              limitingReagent: false,
              equivalents: 1,
              amountPlannedInGrams: 20,
              amountPlannedUnit: AmtPlannedUnit.G,
            },
            {
              id: 2,
              reagentId: 3,
              reactionSchemeLocation: ReactionSchemeLocation.BELOW_ARROW,
              experimentId: 1,
              limitingReagent: false,
              equivalents: 1,
              amountPlannedInGrams: 20,
              amountPlannedUnit: AmtPlannedUnit.ML,
            },
            {
              id: 9,
              reagentId: 1,
              reactionSchemeLocation: ReactionSchemeLocation.LEFT_SIDE,
              experimentId: 1,
              equivalents: 1,
              limitingReagent: true,
              amountPlannedInGrams: 10,
              amountPlannedUnit: AmtPlannedUnit.G,
            },
          ].sort(compareExptReagent),
        },
      };

      const resultBody: AssignReagentToExperimentHandlerResponse = result.body;
      const { reagents, ...rest } = resultBody.experiment;

      reagents.sort(compareExptReagent);

      const sortedResult = { experiment: { ...rest, reagents: reagents } };

      expect(sortedResult).toStrictEqual(expectedResult);
    });

    test("throws error if reagent not in DB", async () => {
      const payload: AssignReagentToExperimentHandlerRequest = {
        experimentId: "1",
        reagentId: "100",
        reactionSchemeLocation: "LEFT_SIDE",
        equivalents: 1,
        limitingReagent: false,
        amountPlannedInGrams: 10,
        amountPlannedUnit: "G",
      };

      await supertest(server)
        .post("/experiments/assignReagentToExperiment")
        .send(payload)
        .expect(404);
    });

    test("throws error if duplicate reagent attempted to be assigned in an experiment", async () => {
      const payload: AssignReagentToExperimentHandlerRequest = {
        experimentId: "1",
        reagentId: "2",
        reactionSchemeLocation: "LEFT_SIDE",
        equivalents: 1,
        limitingReagent: false,
        amountPlannedInGrams: 10,
        amountPlannedUnit: "G",
      };

      await supertest(server)
        .post("/experiments/assignReagentToExperiment")
        .send(payload)
        .expect(400);
    });

    test("a non limiting reagent can be assigned after a limiting reagent has been assigned", async () => {
      const payload: AssignReagentToExperimentHandlerRequest = {
        experimentId: "2",
        reagentId: "1",
        reactionSchemeLocation: "ABOVE_ARROW",
        equivalents: 1,
        limitingReagent: false,
        amountPlannedInGrams: 10,
        amountPlannedUnit: "G",
      };

      const result = await supertest(server)
        .post("/experiments/assignReagentToExperiment")
        .send(payload);

      const expectedResult = {
        experiment: {
          id: 2,
          name: "01012024-suzuki coupling",
          parentId: 4,
          reagents: [
            {
              equivalents: 1,
              experimentId: 2,
              id: 3,
              limitingReagent: true,
              reactionSchemeLocation: ReactionSchemeLocation.LEFT_SIDE,
              reagentId: 4,
              amountPlannedInGrams: null,
              amountPlannedUnit: null,
            },
            {
              equivalents: 1,
              experimentId: 2,
              id: 4,
              limitingReagent: false,
              reactionSchemeLocation: ReactionSchemeLocation.LEFT_SIDE,
              reagentId: 5,
              amountPlannedInGrams: null,
              amountPlannedUnit: null,
            },
            {
              equivalents: 1,
              experimentId: 2,
              id: 5,
              limitingReagent: false,
              reactionSchemeLocation: ReactionSchemeLocation.ABOVE_ARROW,
              reagentId: 6,
              amountPlannedInGrams: null,
              amountPlannedUnit: null,
            },
            {
              equivalents: 1,
              experimentId: 2,
              id: 6,
              limitingReagent: false,
              reactionSchemeLocation: ReactionSchemeLocation.BELOW_ARROW,
              reagentId: 7,
              amountPlannedInGrams: null,
              amountPlannedUnit: null,
            },
            {
              equivalents: 1,
              experimentId: 2,
              id: 7,
              limitingReagent: false,
              reactionSchemeLocation: ReactionSchemeLocation.BELOW_ARROW,
              reagentId: 8,
              amountPlannedInGrams: null,
              amountPlannedUnit: null,
            },
            {
              equivalents: 1,
              experimentId: 2,
              id: 8,
              limitingReagent: false,
              reactionSchemeLocation: ReactionSchemeLocation.RIGHT_SIDE,
              reagentId: 9,
              amountPlannedInGrams: null,
              amountPlannedUnit: null,
            },
            {
              equivalents: 1,
              experimentId: 2,
              id: 9,
              limitingReagent: false,
              reactionSchemeLocation: ReactionSchemeLocation.ABOVE_ARROW,
              reagentId: 1,
              amountPlannedInGrams: 10,
              amountPlannedUnit: AmtPlannedUnit.G,
            },
          ].sort(compareExptReagent),
        },
      };

      const resultBody: AssignReagentToExperimentHandlerResponse = result.body;
      const { reagents, ...rest } = resultBody.experiment;

      reagents.sort(compareExptReagent);

      const sortedResult = { experiment: { ...rest, reagents: reagents } };

      expect(sortedResult).toStrictEqual(expectedResult);
    });

    test("throws error if there is already a limiting reagent and another one is assigned", async () => {
      const payload: AssignReagentToExperimentHandlerRequest = {
        experimentId: "2",
        reagentId: "2",
        reactionSchemeLocation: "LEFT_SIDE",
        equivalents: 1,
        limitingReagent: true,
        amountPlannedInGrams: 10,
        amountPlannedUnit: "G",
      };

      const res = await supertest(server)
        .post("/experiments/assignReagentToExperiment")
        .send(payload);

      expect(res.text).toStrictEqual(
        '"Error: Experiment 2 already has a limiting reagent: diethyl(3-pyridyl)borane"',
      );
      expect(res.status).toBe(500);
    });
  });

  describe("GET /:id", () => {
    test("returns an experiment if found", async () => {
      const result = await supertest(server).get("/experiments/1");
      const expectedResult: GetExperimentByIdHandlerResponse = {
        experiment: {
          parentId: 4,
          name: "01012024-random reaction",
          id: 1,
          reagents: [
            {
              id: 1,
              experimentId: 1,
              equivalents: 1,
              limitingReagent: false,
              reactionSchemeLocation: "ABOVE_ARROW",
              reagentId: 2,
              amountPlannedInGrams: 20,
              amountPlannedUnit: "G",
              reagent: {
                density: 0.6,
                id: 2,
                molecularWeight: 58.12,
                name: "butane",
                canonicalSMILES: "CCCC",
              },
            },
            {
              id: 2,
              experimentId: 1,
              equivalents: 1,
              limitingReagent: false,
              reactionSchemeLocation: "BELOW_ARROW",
              reagentId: 3,
              amountPlannedInGrams: 20,
              amountPlannedUnit: "ML",
              reagent: {
                density: 0.888,
                id: 3,
                molecularWeight: 72.11,
                name: "thf",
                canonicalSMILES: "C1CCOC1",
              },
            },
          ],
        },
      };

      expect(result.body).toStrictEqual(expectedResult);
    });

    test("returns null if experiment not found", async () => {
      const result = await supertest(server).get("/experiments/100");
      const expectedResult = {
        experiment: null,
      };

      expect(result.body).toStrictEqual(expectedResult);
    });

    test("returns experiment if there are no reagents added yet -- make sure left outer join works", async () => {
      const result = await supertest(server).get("/experiments/3");
      const expectedResult = {
        experiment: {
          parentId: 4,
          name: "An experiment with no reagents yet",
          id: 3,
          reagents: [],
        },
      };

      expect(result.body).toStrictEqual(expectedResult);
    });
  });
});
