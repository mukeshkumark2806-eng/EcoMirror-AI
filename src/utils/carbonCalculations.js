/**
 * @fileoverview Centralised carbon calculation constants and pure functions.
 * Eliminates the duplication of TRANSPORT_FACTORS, FOOD_FACTORS, etc.
 * that previously existed across DashboardPage and EcoCoachPage.
 * @module utils/carbonCalculations
 */

/** Relative transport emission factors (1.0 = worst). */
export const TRANSPORT_FACTORS = {
  car: 1.0, bike: 0.6, bus: 0.3,
  train: 0.2, walking: 0, bicycle: 0,
};

/** Relative food emission factors (1.0 = worst). */
export const FOOD_FACTORS = {
  vegetarian: 0.2, mixed: 0.5, heavy_meat: 1.0,
};

/** Relative water usage factors (1.0 = worst). */
export const WATER_FACTORS = {
  low: 0.1, medium: 0.4, high: 0.8,
};

/** Energy slider definitions with per-unit carbon cost (kg CO₂/h). */
export const ENERGY_SLIDERS = [
  { id: 'ac_hours', carbonPerUnit: 1.5 },
  { id: 'fan_hours', carbonPerUnit: 0.1 },
  { id: 'appliance_hours', carbonPerUnit: 0.5 },
];

/**
 * Maximum theoretical daily carbon (kg) used to normalise Eco Score.
 * Derived from summing worst-case values across all categories.
 */
export const MAX_CARBON_KG = 113;

/**
 * Calculates a numeric Eco Score (0–100) from a set of assessment responses.
 * Higher score = lower footprint.
 *
 * @param {object} responses - Assessment responses object.
 * @param {string} responses.transport - Transport mode key.
 * @param {object} [responses.energy] - Energy usage sliders.
 * @param {string} responses.food - Diet key.
 * @param {string} responses.water - Water key.
 * @returns {{ score: number, carbonKg: number }}
 */
export function calcScoreFromResponses(responses) {
  let carbon = 0;

  carbon += (TRANSPORT_FACTORS[responses.transport] ?? 0) * 30;

  const energy = responses.energy ?? {};
  ENERGY_SLIDERS.forEach(({ id, carbonPerUnit }) => {
    carbon += (energy[id] ?? 0) * carbonPerUnit;
  });

  carbon += (FOOD_FACTORS[responses.food] ?? 0) * 25;
  carbon += (WATER_FACTORS[responses.water] ?? 0) * 15;

  const score = Math.max(0, Math.min(100, Math.round(100 - (carbon / MAX_CARBON_KG) * 100)));
  return { score, carbonKg: carbon };
}

/**
 * Derives an impact level object from an Eco Score.
 * @param {number} score - Eco Score (0–100).
 * @returns {{ level: 'Green'|'Moderate'|'High', color: string }}
 */
export function getImpactLevel(score) {
  if (score >= 70) return { level: 'Green', color: '#34d399' };
  if (score >= 40) return { level: 'Moderate', color: '#fbbf24' };
  return { level: 'High', color: '#f87171' };
}

/**
 * Calculates percentage savings for a set of impact categories.
 * @param {number} currentCarbon
 * @param {number} futureCarbon
 * @returns {number} Percentage reduction (0–100).
 */
export function calcCarbonReductionPct(currentCarbon, futureCarbon) {
  if (currentCarbon <= 0) return 0;
  return Math.max(0, Math.round(((currentCarbon - futureCarbon) / currentCarbon) * 100));
}
