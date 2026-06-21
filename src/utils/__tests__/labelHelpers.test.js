/**
 * @fileoverview Tests for label helper utilities.
 * @module utils/__tests__/labelHelpers.test
 */

import { describe, it, expect } from 'vitest';
import {
  getTransportLabel,
  getFoodLabel,
  getWaterLabel,
  getImpactLevelText,
} from '../labelHelpers';

// Minimal mock translate function — returns the fallback
const t = (key, fallback) => fallback ?? key;

describe('getTransportLabel', () => {
  it('returns emoji + english label for car', () => {
    const result = getTransportLabel('car', t);
    expect(result).toContain('🚗');
    expect(result).toContain('Car');
  });

  it('returns bicycle label', () => {
    const result = getTransportLabel('bicycle', t);
    expect(result).toContain('🚲');
    expect(result).toContain('Bicycle');
  });

  it('handles unknown key gracefully', () => {
    const result = getTransportLabel('hoverboard', t);
    expect(result).toBe('hoverboard');
  });

  it('works without a translate function', () => {
    const result = getTransportLabel('bus');
    expect(result).toContain('Bus');
  });
});

describe('getFoodLabel', () => {
  it('returns vegetarian label', () => {
    expect(getFoodLabel('vegetarian', t)).toContain('Vegetarian');
  });

  it('returns heavy_meat label', () => {
    expect(getFoodLabel('heavy_meat', t)).toContain('Heavy Meat');
  });

  it('handles unknown diet key', () => {
    expect(getFoodLabel('keto', t)).toBe('keto');
  });
});

describe('getWaterLabel', () => {
  it('returns low label with emoji', () => {
    const result = getWaterLabel('low', t);
    expect(result).toContain('💧');
    expect(result).toContain('Low');
  });

  it('returns high label with emoji', () => {
    const result = getWaterLabel('high', t);
    expect(result).toContain('🌊');
    expect(result).toContain('High');
  });
});

describe('getImpactLevelText', () => {
  it('returns Green label', () => {
    expect(getImpactLevelText('Green', t)).toContain('Green');
  });

  it('returns Moderate label', () => {
    expect(getImpactLevelText('Moderate', t)).toContain('Moderate');
  });

  it('returns High label', () => {
    expect(getImpactLevelText('High', t)).toContain('High');
  });

  it('returns level as-is for unknown', () => {
    expect(getImpactLevelText('Unknown', t)).toBe('Unknown');
  });

  it('works without translate function', () => {
    expect(getImpactLevelText('Green')).toContain('Green');
  });
});
