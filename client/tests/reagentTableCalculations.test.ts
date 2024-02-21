import { calculateMmolOfLimitingReagent } from "../src/utils";
import { test, expect, describe } from "vitest";

describe("calculations in reagent table tests", () => {
  describe("calculateMmolOfLimitingReagent", () => {
    test("correctly calculates the mmol", async () => {
      // 1 g of the limiting reagent
      // at 100 g/mol
      const mmol = calculateMmolOfLimitingReagent(1, 100);
      expect(mmol).toEqual(10);
    });
  });
});
