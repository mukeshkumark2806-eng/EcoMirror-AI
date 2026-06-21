import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEcoScore } from '../useEcoScore';

beforeEach(() => {
  localStorage.clear();
});

describe('useEcoScore', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useEcoScore());
    expect(result.current.score).toBe(50);
    expect(result.current.history).toEqual([]);
    expect(result.current.categoryBreakdown).toEqual({
      transport: 25,
      food: 25,
      energy: 25,
      shopping: 25,
    });
  });

  it('updates score and history correctly', () => {
    const { result } = renderHook(() => useEcoScore());
    let newScore;
    act(() => {
      newScore = result.current.updateScore(15, { transport: 10, food: 20, energy: 30, shopping: 40 });
    });

    expect(result.current.score).toBe(newScore);
    expect(result.current.categoryBreakdown).toEqual({
      transport: 10,
      food: 20,
      energy: 30,
      shopping: 40,
    });
    expect(result.current.history.length).toBe(1);
    expect(result.current.history[0].carbonKg).toBe(15);
  });

  it('initializes sample history from onboarding quiz', () => {
    const { result } = renderHook(() => useEcoScore());
    const mockQuiz = {
      transport: 'car_daily',
      diet: 'heavy_meat',
      housing: 'large_house',
      energy: 'fossil',
      shopping: 'frequent',
      travel: 'frequent_flights',
    };

    let score;
    act(() => {
      score = result.current.initFromQuiz(mockQuiz);
    });

    expect(score).toBeGreaterThan(0);
    expect(result.current.score).toBe(score);
    expect(result.current.history.length).toBe(7);
  });
});
