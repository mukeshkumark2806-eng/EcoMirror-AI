/**
 * @fileoverview Safe localStorage wrapper with schema validation.
 * All reads/writes are guarded against JSON parse errors, quota errors,
 * and data injection from untrusted sources.
 * @module utils/storage
 */

/** Namespace prefix applied to every key. */
const PREFIX = 'ecomirror_';

/**
 * Allowed top-level keys that may be written via importData.
 * @type {Set<string>}
 */
const ALLOWED_IMPORT_KEYS = new Set([
  'ecomirror_user',
  'ecomirror_assessment_result',
  'ecomirror_gamification',
  'ecomirror_scores',
  'ecomirror_activities',
  'ecomirror_language',
]);

/**
 * Safely reads and JSON-parses a localStorage value.
 * @param {string} key - Prefixed storage key.
 * @param {*} fallback - Value returned on missing/corrupt data.
 * @returns {*}
 */
export function safeRead(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Safely JSON-stringifies and writes a value to localStorage.
 * @param {string} key - Prefixed storage key.
 * @param {*} value - Value to persist.
 * @returns {boolean} True on success.
 */
export function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`[EcoMirror] Failed to persist "${key}":`, e.message);
    return false;
  }
}

/**
 * Safely removes a key from localStorage.
 * @param {string} key - Prefixed storage key.
 */
export function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // silently ignore
  }
}

/**
 * Validates an import payload, rejecting unknown or potentially dangerous keys.
 * @param {unknown} data - Parsed JSON from the backup file.
 * @returns {{ valid: boolean, sanitized: Record<string, unknown> }}
 */
export function validateImportPayload(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, sanitized: {} };
  }

  const sanitized = {};
  let hasValidKey = false;

  for (const [key, value] of Object.entries(data)) {
    // Only allow known prefixed keys
    if (!key.startsWith(PREFIX)) continue;
    if (!ALLOWED_IMPORT_KEYS.has(key)) continue;
    // Reject non-serialisable values
    try {
      JSON.stringify(value); // will throw on circular / function values
      sanitized[key] = value;
      hasValidKey = true;
    } catch {
      console.warn(`[EcoMirror] Skipping import key "${key}": not serialisable.`);
    }
  }

  return { valid: hasValidKey, sanitized };
}

/**
 * Exports all EcoMirror localStorage keys as a plain object.
 * @returns {Record<string, unknown>}
 */
export function exportAllData() {
  const data = {};
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(PREFIX)) {
        data[key] = safeRead(key);
      }
    }
  } catch {
    // localStorage may be unavailable in some contexts
  }
  return data;
}

/**
 * Clears all EcoMirror-prefixed keys from localStorage.
 */
export function clearAllData() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
    keys.forEach(k => safeRemove(k));
  } catch {
    // silently ignore
  }
}
