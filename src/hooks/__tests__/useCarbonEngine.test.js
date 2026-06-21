import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCarbonEngine } from '../useCarbonEngine';

describe('useCarbonEngine', () => {
  it('calculates carbon footprint correctly for basic activities', () => {
    const { result } = renderHook(() => useCarbonEngine());
    const engine = result.current;

    // transport -> driving factor is 0.17
    const transportCarbon = engine.calculate('transport', 'driving', 10);
    expect(transportCarbon).toBe(1.7);

    // non-existent returns 0
    const invalidCarbon = engine.calculate('unknown', 'type', 10);
    expect(invalidCarbon).toBe(0);
  });

  it('gets correct categories and activity details', () => {
    const { result } = renderHook(() => useCarbonEngine());
    const engine = result.current;

    const categories = engine.getCategories();
    expect(categories).toContain('transport');
    expect(categories).toContain('food');

    const transportActivities = engine.getActivities('transport');
    expect(transportActivities.length).toBeGreaterThan(0);
    expect(transportActivities.some(a => a.key === 'driving')).toBe(true);

    const nonExistent = engine.getActivities('unknown');
    expect(nonExistent).toEqual([]);
  });

  it('calculates daily totals correctly', () => {
    const { result } = renderHook(() => useCarbonEngine());
    const engine = result.current;

    const mockActivities = [
      { id: '1', date: '2026-06-21', carbonKg: 2.5 },
      { id: '2', date: '2026-06-21', carbonKg: 1.5 },
      { id: '3', date: '2026-06-22', carbonKg: 10.0 },
    ];

    expect(engine.dailyTotal(mockActivities, '2026-06-21')).toBe(4.0);
    expect(engine.dailyTotal(mockActivities, '2026-06-22')).toBe(10.0);
    expect(engine.dailyTotal(mockActivities, '2026-06-23')).toBe(0);
  });

  it('computes category breakdowns correctly', () => {
    const { result } = renderHook(() => useCarbonEngine());
    const engine = result.current;

    const mockActivities = [
      { id: '1', category: 'transport', carbonKg: 50 },
      { id: '2', category: 'food', carbonKg: 30 },
      { id: '3', category: 'energy', carbonKg: 20 },
    ];

    const breakdown = engine.categoryBreakdown(mockActivities);
    expect(breakdown.transport).toBe(50);
    expect(breakdown.food).toBe(30);
    expect(breakdown.energy).toBe(20);
    expect(breakdown.shopping).toBe(0);

    const emptyBreakdown = engine.categoryBreakdown([]);
    expect(emptyBreakdown).toEqual({ transport: 25, food: 25, energy: 25, shopping: 25 });
  });

  it('estimates scores and carbon from quiz options correctly', () => {
    const { result } = renderHook(() => useCarbonEngine());
    const engine = result.current;

    const quiz = {
      transport: 'car_daily',
      diet: 'heavy_meat',
      housing: 'large_house',
    };

    const score = engine.scoreFromQuiz(quiz);
    expect(score).toBe(15); // (15 + 10 + 20) / 3 = 15

    const carbon = engine.dailyCarbonFromQuiz(quiz);
    expect(carbon).toBe(23.5); // 8.5 + 9.0 + 6.0 = 23.5

    const emptyQuizScore = engine.scoreFromQuiz({});
    expect(emptyQuizScore).toBe(50);
  });
});
