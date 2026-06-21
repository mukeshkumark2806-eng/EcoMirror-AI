import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActivities } from '../useActivities';

beforeEach(() => {
  localStorage.clear();
});

describe('useActivities', () => {
  it('initializes with empty activities list', () => {
    const { result } = renderHook(() => useActivities());
    expect(result.current.activities).toEqual([]);
  });

  it('adds and removes activities correctly', () => {
    const { result } = renderHook(() => useActivities());

    let added;
    act(() => {
      added = result.current.addActivity({
        category: 'transport',
        type: 'driving',
        value: 10,
        notes: 'Test trip',
      });
    });

    expect(added).toBeDefined();
    expect(added.id).toBeDefined();
    expect(added.carbonKg).toBe(1.7); // 10 * 0.17 = 1.7
    expect(result.current.activities.length).toBe(1);
    expect(result.current.activities[0].notes).toBe('Test trip');

    // Remove it
    act(() => {
      result.current.removeActivity(added.id);
    });

    expect(result.current.activities.length).toBe(0);
  });

  it('filters and aggregates activities correctly', () => {
    const { result } = renderHook(() => useActivities());

    act(() => {
      result.current.addActivity({ category: 'transport', type: 'driving', value: 10 });
      result.current.addActivity({ category: 'food', type: 'vegetarian', value: 2 });
    });

    expect(result.current.getActivitiesByCategory('transport').length).toBe(1);
    expect(result.current.getActivitiesByCategory('food').length).toBe(1);
    expect(result.current.getActivitiesByCategory('energy').length).toBe(0);

    expect(result.current.getRecentActivities(1).length).toBe(1);

    expect(result.current.getTotalCarbon()).toBeGreaterThan(0);
    expect(result.current.getCategoryBreakdown()).toHaveProperty('transport');
    expect(result.current.getCategoryBreakdown()).toHaveProperty('food');
  });

  it('calculates weekly data format correctly', () => {
    const { result } = renderHook(() => useActivities());

    act(() => {
      result.current.addActivity({ category: 'transport', type: 'driving', value: 10 });
    });
    const weekly = result.current.getWeeklyData();

    expect(weekly.length).toBe(7);
    expect(weekly[6].carbonKg).toBe(1.7); // today is the last day in weekly list
  });
});
