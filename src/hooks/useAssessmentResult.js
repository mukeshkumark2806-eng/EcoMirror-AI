/**
 * @fileoverview useAssessmentResult Hook.
 * Manages the baseline carbon footprint assessment state in localStorage.
 * @module hooks/useAssessmentResult
 */

import { useLocalStorage } from './useLocalStorage';

/**
 * Custom hook to get and set the user's assessment result.
 * Eliminates duplicate try-catch retrieval logic across components.
 *
 * @returns {[object|null, Function, Function]} Tuple of [result, setResult, removeResult].
 */
export function useAssessmentResult() {
  return useLocalStorage('assessment_result', null);
}
