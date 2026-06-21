/**
 * @fileoverview Tests for carbon calculation utilities.
 * @module utils/__tests__/carbonCalculations.test
 */

import { describe, it, expect } from 'vitest';
import {
  calcScoreFromResponses,
  getImpactLevel,
  calcCarbonReductionPct,
  TRANSPORT_FACTORS,
  FOOD_FACTORS,
  WATER_FACTORS,
} from '../carbonCalculations';

describe('calcScoreFromResponses', () => {
  it('returns a score between 0 and 100', () => {
    const { score } = calcScoreFromResponses({
      transport: 'car',
      food: 'heavy_meat',
      water: 'high',
      energy: { ac_hours: 8, fan_hours: 12, appliance_hours: 8 },
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('gives a higher score for eco-friendly choices', () => {
    const { score: lowScore } = calcScoreFromResponses({
      transport: 'car',
      food: 'heavy_meat',
      water: 'high',
      energy: { ac_hours: 8, fan_hours: 8, appliance_hours: 8 },
    });
    const { score: highScore } = calcScoreFromResponses({
      transport: 'bicycle',
      food: 'vegetarian',
      water: 'low',
      energy: { ac_hours: 0, fan_hours: 0, appliance_hours: 0 },
    });
    expect(highScore).toBeGreaterThan(lowScore);
  });

  it('gives score >= 90 for near-zero-carbon lifestyle', () => {
    // water: 'low' still has a small factor (0.1), so score won't be exactly 100
    const { score } = calcScoreFromResponses({
      transport: 'walking',
      food: 'vegetarian',
      water: 'low',
      energy: { ac_hours: 0, fan_hours: 0, appliance_hours: 0 },
    });
    expect(score).toBeGreaterThanOrEqual(90);
  });

  it('handles missing energy gracefully', () => {
    const { score } = calcScoreFromResponses({
      transport: 'bus',
      food: 'mixed',
      water: 'medium',
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('handles unknown transport key with 0 factor', () => {
    const { score } = calcScoreFromResponses({
      transport: 'unknown_mode',
      food: 'vegetarian',
      water: 'low',
    });
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('getImpactLevel', () => {
  it('returns Green for score >= 70', () => {
    expect(getImpactLevel(70).level).toBe('Green');
    expect(getImpactLevel(100).level).toBe('Green');
  });

  it('returns Moderate for score 40–69', () => {
    expect(getImpactLevel(40).level).toBe('Moderate');
    expect(getImpactLevel(69).level).toBe('Moderate');
  });

  it('returns High for score < 40', () => {
    expect(getImpactLevel(0).level).toBe('High');
    expect(getImpactLevel(39).level).toBe('High');
  });

  it('returns expected hex color for each level', () => {
    expect(getImpactLevel(80).color).toBe('#34d399');
    expect(getImpactLevel(50).color).toBe('#fbbf24');
    expect(getImpactLevel(20).color).toBe('#f87171');
  });
});

describe('calcCarbonReductionPct', () => {
  it('calculates percentage reduction correctly', () => {
    expect(calcCarbonReductionPct(100, 70)).toBe(30);
    expect(calcCarbonReductionPct(50, 25)).toBe(50);
  });

  it('returns 0 if current carbon is 0', () => {
    expect(calcCarbonReductionPct(0, 0)).toBe(0);
  });

  it('returns 0 if future is same as current', () => {
    expect(calcCarbonReductionPct(50, 50)).toBe(0);
  });

  it('clamps to 0 if future > current', () => {
    expect(calcCarbonReductionPct(50, 100)).toBe(0);
  });
});

describe('emission factor constants', () => {
  it('car has highest transport factor', () => {
    const values = Object.values(TRANSPORT_FACTORS);
    expect(TRANSPORT_FACTORS.car).toBe(Math.max(...values));
  });

  it('walking and bicycle have zero transport factor', () => {
    expect(TRANSPORT_FACTORS.walking).toBe(0);
    expect(TRANSPORT_FACTORS.bicycle).toBe(0);
  });

  it('heavy_meat has highest food factor', () => {
    const values = Object.values(FOOD_FACTORS);
    expect(FOOD_FACTORS.heavy_meat).toBe(Math.max(...values));
  });

  it('vegetarian has lowest food factor', () => {
    const values = Object.values(FOOD_FACTORS);
    expect(FOOD_FACTORS.vegetarian).toBe(Math.min(...values));
  });
});
