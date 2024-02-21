/**
 * Returns the mmol of the limiting reagent
 *
 *
 * @param amountOfLimitingReagentInGrams - the amount in grams of the limiting reagent
 * @param molecularWeight - the molecular weight of the limiting reagent
 * @returns mmol of the limiting reagent
 *
 *
 */
export const calculateMmolOfLimitingReagent = (
  amountOfLimitingReagentInGrams: number,
  molecularWeight: number,
) => {
  // 1 eq * g / (g/mol) * 1000 mmol/mol
  return (amountOfLimitingReagentInGrams / molecularWeight) * 1000;
};

/**
 * Returns the mg of reagent, depending on the mmol of the limiting reagent
 * In order to determine how much of a non-limiting reagent is needed:
 * equivalents of current reagent * mmol of limiting reagent * molecular weight of current reagent
 * eq * mmol * g/mol ==> mg
 *
 * @param eq - equivalents of current reagent
 * @param mmolOfLimitingReagent
 * @param molecularWeightOfCurrentRegent
 * @returns mg of the current reagent for the reaction
 *
 *
 */
export const calculateAmountInMgOfReagent = (
  eq: number,
  mmolOfLimitingReagent: number,
  molecularWeightOfCurrentRegent: number,
) => {
  return eq * mmolOfLimitingReagent * molecularWeightOfCurrentRegent;
};
