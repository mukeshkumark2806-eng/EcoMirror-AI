/**
 * @fileoverview UserContext — global user profile and preferences store.
 * All localStorage operations are delegated to the safe storage utilities.
 * @module context/UserContext
 */

import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  validateImportPayload,
  exportAllData,
  clearAllData,
  safeRead,
  safeWrite,
} from '../utils/storage';

const UserContext = createContext(null);

/** @type {object} Default user shape for new installs. */
const DEFAULT_USER = {
  id: null,
  name: 'EcoExplorer',
  createdAt: null,
  onboardingComplete: false,
  quiz: {},
  preferences: {
    units: 'metric',
    theme: 'dark',
  },
};

/**
 * Provides user state and mutation actions to the entire component tree.
 * @param {{ children: React.ReactNode }} props
 */
export function UserProvider({ children }) {
  const [user, setUser] = useLocalStorage('user', DEFAULT_USER);

  /** Finalises the onboarding quiz and stamps a user ID. */
  const completeOnboarding = (quizAnswers) => {
    setUser(prev => ({
      ...prev,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
      onboardingComplete: true,
      quiz: quizAnswers,
    }));
  };

  /** Merges partial preference updates. */
  const updatePreferences = (prefs) => {
    setUser(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...prefs },
    }));
  };

  /** Updates the display name (trimmed). */
  const updateName = (name) => {
    const trimmed = String(name).trim().slice(0, 50); // length guard
    if (trimmed) setUser(prev => ({ ...prev, name: trimmed }));
  };

  /**
   * Resets all EcoMirror data and returns the user to the default state.
   * Uses the safe storage utility to clear all prefixed keys.
   */
  const resetUser = () => {
    clearAllData();
    setUser(DEFAULT_USER);
  };

  /**
   * Exports all EcoMirror localStorage data as a plain object.
   * @returns {Record<string, unknown>}
   */
  const exportData = () => exportAllData();

  /**
   * Imports data from a backup object.
   * Keys are validated against an allowlist before writing.
   *
   * @param {unknown} data - Raw parsed JSON from a backup file.
   * @returns {{ success: boolean, message: string }}
   */
  const importData = (data) => {
    const { valid, sanitized } = validateImportPayload(data);
    if (!valid) {
      return { success: false, message: 'Invalid backup file — no recognised keys found.' };
    }

    for (const [key, value] of Object.entries(sanitized)) {
      safeWrite(key, value);
    }

    // Reload the user record from the sanitized import
    const userData = safeRead('ecomirror_user', DEFAULT_USER);
    setUser(userData);

    return { success: true, message: 'Data imported successfully.' };
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isOnboarded: user.onboardingComplete,
        completeOnboarding,
        updatePreferences,
        updateName,
        resetUser,
        exportData,
        importData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

/**
 * @returns {ReturnType<typeof UserProvider>}
 * @throws {Error} If used outside of UserProvider.
 */
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
