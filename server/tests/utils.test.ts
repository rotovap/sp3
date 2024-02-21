import { calculateMmolOfLimitingReagent } from "../../client/src/utils";
import { isSomeEnum } from "../utils";
import { test, describe, expect } from "@jest/globals";

describe("utils tests", () => {
  describe("isSomeEnum tests", () => {
    enum TestEnum {
      G = "G",
      MG = "MG",
    }
    test("returns true if string is part of enum", () => {
      expect(isSomeEnum(TestEnum)("G")).toEqual(true);
    });

    test("returns false if string is part of enum", () => {
      expect(isSomeEnum(TestEnum)("NOPE")).toEqual(false);
    });
  });
});
