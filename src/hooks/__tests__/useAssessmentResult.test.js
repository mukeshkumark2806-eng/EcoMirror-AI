import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAssessmentResult } from '../useAssessmentResult';

beforeEach(() => {
  localStorage.clear();
});

describe('useAssessmentResult', () => {
  it('should initialize with null', () => {
    const { result } = renderHook(() => useAssessmentResult());
    expect(result.current[0]).toBeNull();
  });

  it('should write and read assessment results', () => {
    const mockResult = { ecoScore: 85, responses: { transport: 'bus' } };
    const { result } = renderHook(() => useAssessmentResult());

    act(() => {
      result.current[1](mockResult);
    });

    expect(result.current[0]).toEqual(mockResult);
    expect(JSON.parse(localStorage.getItem('ecomirror_assessment_result'))).toEqual(mockResult);
  });

  it('should remove the assessment results', () => {
    const mockResult = { ecoScore: 85 };
    const { result } = renderHook(() => useAssessmentResult());

    act(() => {
      result.current[1](mockResult);
    });
    expect(result.current[0]).toEqual(mockResult);

    act(() => {
      result.current[2](); // remove
    });
    expect(result.current[0]).toBeNull();
    expect(localStorage.getItem('ecomirror_assessment_result')).toBe('null');
  });
});
