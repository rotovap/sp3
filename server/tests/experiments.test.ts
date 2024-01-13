import { server } from "../index";
import {
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
          id: 2,
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
      };

      const result = await supertest(server)
        .post("/experiments/assignReagentToExperiment")
        .send(payload);

      const expectedResult = {
        experiment: {
          id: 1,
          name: "01012024-suzuki coupling",
          parentId: 4,
          reagents: [
            {
              id: 1,
              reagentId: 2,
              reactionSchemeLocation: ReactionSchemeLocation.ABOVE_ARROW,
              experimentId: 1,
              equivalents: 1,
            },
            {
              id: 2,
              reagentId: 1,
              reactionSchemeLocation: ReactionSchemeLocation.LEFT_SIDE,
              experimentId: 1,
              equivalents: 1,
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
      };

      await supertest(server)
        .post("/experiments/assignReagentToExperiment")
        .send(payload)
        .expect(400);
    });
  });

  describe("GET /:id", () => {
    test.only("returns an experiment if found", async () => {
      const result = await supertest(server).get("/experiments/1");
      const expectedResult: GetExperimentByIdHandlerResponse = {
        experiment: {
          parentId: 4,
          name: "01012024-suzuki coupling",
          id: 1,
          reagents: [
            {
              id: 1,
              experimentId: 1,
              equivalents: 1,
              reactionSchemeLocation: "ABOVE_ARROW",
              reagentId: 2,
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
              reactionSchemeLocation: "BELOW_ARROW",
              reagentId: 3,
              reagent: {
                density: 0.888,
                id: 2,
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
  });
});
