/**
 * @fileoverview Safe localStorage hook with stable reference semantics.
 * Reads and writes are fully guarded against JSON errors and quota exhaustion.
 * @module hooks/useLocalStorage
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Persists state to localStorage under a namespaced key.
 *
 * @template T
 * @param {string} key - Storage key (will be prefixed with "ecomirror_").
 * @param {T} defaultValue - Value used when no stored value exists.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>, () => void]}
 *   A tuple of [value, setValue, remove].
 */
export function useLocalStorage(key, defaultValue) {
  const prefixedKey = `ecomirror_${key}`;

  // Keep a stable ref to defaultValue so the remove callback deps don't change
  // when the caller passes an object literal.
  const defaultRef = useRef(defaultValue);

  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(prefixedKey);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(prefixedKey, JSON.stringify(value));
    } catch (e) {
      console.warn(`[EcoMirror] Failed to persist "${prefixedKey}":`, e.message);
    }
  }, [prefixedKey, value]);

  /**
   * Removes the key from localStorage and resets state to the default value.
   * Stable reference — safe to use in dependency arrays.
   */
  const remove = useCallback(() => {
    try {
      localStorage.removeItem(prefixedKey);
    } catch {
      // ignore
    }
    setValue(defaultRef.current);
  }, [prefixedKey]);

  return [value, setValue, remove];
}
