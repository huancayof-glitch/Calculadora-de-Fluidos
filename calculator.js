(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.PediatricFluids = api;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const THRESHOLDS = Object.freeze({
    LOW_WEIGHT_MAX_EXCLUSIVE: 10,
    MID_WEIGHT_MAX_INCLUSIVE: 30,
  });

  function requirePositiveFinite(value, label) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(label + " debe ser un número positivo.");
    }
  }

  function calculate(weightKg, hours) {
    const weight = Number(weightKg);
    const periodHours = Number(hours);

    requirePositiveFinite(weight, "El peso");
    requirePositiveFinite(periodHours, "Las horas");

    let category;
    let categoryLabel;
    let bodySurfaceArea = null;
    let insensibleHourly;
    let insensibleFormula;

    if (weight < THRESHOLDS.LOW_WEIGHT_MAX_EXCLUSIVE) {
      category = "lt10";
      categoryLabel = "Menor de 10 kg";
      insensibleHourly = (weight * 33) / 24;
      insensibleFormula = "(P × 33 ÷ 24) × horas";
    } else if (weight <= THRESHOLDS.MID_WEIGHT_MAX_INCLUSIVE) {
      category = "10to30";
      categoryLabel = "Entre 10 y 30 kg";
      bodySurfaceArea = (weight * 4 + 7) / (weight + 90);
      insensibleHourly = (bodySurfaceArea * 400) / 24;
      insensibleFormula = "(SC × 400 ÷ 24) × horas";
    } else {
      category = "gt30";
      categoryLabel = "Mayor de 30 kg";
      insensibleHourly = weight * 0.5;
      insensibleFormula = "P × 0,5 × horas";
    }

    const endogenousHourly =
      weight <= THRESHOLDS.MID_WEIGHT_MAX_INCLUSIVE
        ? (weight * 12) / 24
        : insensibleHourly / 3;

    const endogenousFormula =
      weight <= THRESHOLDS.MID_WEIGHT_MAX_INCLUSIVE
        ? "(P × 12 ÷ 24) × horas"
        : "Pérdidas insensibles ÷ 3*";

    return Object.freeze({
      weight,
      hours: periodHours,
      category,
      categoryLabel,
      bodySurfaceArea,
      endogenous: Object.freeze({
        hourly: endogenousHourly,
        total: endogenousHourly * periodHours,
        reference12h: endogenousHourly * 12,
        reference24h: endogenousHourly * 24,
        formula: endogenousFormula,
      }),
      insensible: Object.freeze({
        hourly: insensibleHourly,
        total: insensibleHourly * periodHours,
        reference12h: insensibleHourly * 12,
        reference24h: insensibleHourly * 24,
        formula: insensibleFormula,
      }),
      sourceClarificationRequired: weight > THRESHOLDS.MID_WEIGHT_MAX_INCLUSIVE,
    });
  }

  return Object.freeze({ calculate, THRESHOLDS });
});
