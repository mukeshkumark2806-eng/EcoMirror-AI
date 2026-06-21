/**
 * @fileoverview Shared label helpers for translating assessment response values
 * into display strings. Centralises logic previously duplicated across
 * ResultsPage, DashboardPage, and EcoCoachPage.
 * @module utils/labelHelpers
 */

/** @typedef {function(string, string=): string} TranslateFn */

/**
 * Maps a transport key to a human-readable, emoji-prefixed label.
 * @param {string} key - Transport mode key (e.g. 'car', 'bus').
 * @param {TranslateFn} t - i18n translate function.
 * @returns {string}
 */
export function getTransportLabel(key, t) {
  const emojiMap = {
    car: '🚗', bike: '🏍️', bus: '🚌',
    train: '🚆', walking: '🚶', bicycle: '🚲',
  };
  const englishMap = {
    car: 'Car', bike: 'Motorbike', bus: 'Bus',
    train: 'Train', walking: 'Walking', bicycle: 'Bicycle',
  };
  const emoji = emojiMap[key] ?? '';
  const label = t
    ? t(`assessment.step.transport.opt.${key}.label`, englishMap[key] ?? key)
    : (englishMap[key] ?? key);
  return `${emoji} ${label}`.trim();
}

/**
 * Maps a food/diet key to a human-readable, emoji-prefixed label.
 * @param {string} key - Diet key (e.g. 'vegetarian', 'heavy_meat').
 * @param {TranslateFn} t - i18n translate function.
 * @returns {string}
 */
export function getFoodLabel(key, t) {
  const emojiMap = { vegetarian: '🥦', mixed: '🍱', heavy_meat: '🥩' };
  const englishMap = { vegetarian: 'Vegetarian', mixed: 'Mixed', heavy_meat: 'Heavy Meat' };
  const emoji = emojiMap[key] ?? '';
  const label = t
    ? t(`assessment.step.food.opt.${key}.label`, englishMap[key] ?? key)
    : (englishMap[key] ?? key);
  return `${emoji} ${label}`.trim();
}

/**
 * Maps a water-usage key to a human-readable, emoji-prefixed label.
 * @param {string} key - Water key (e.g. 'low', 'medium', 'high').
 * @param {TranslateFn} t - i18n translate function.
 * @returns {string}
 */
export function getWaterLabel(key, t) {
  const emojiMap = { low: '💧', medium: '🚿', high: '🌊' };
  const englishMap = { low: 'Low', medium: 'Medium', high: 'High' };
  const emoji = emojiMap[key] ?? '';
  const label = t
    ? t(`assessment.step.water.opt.${key}.label`, englishMap[key] ?? key)
    : (englishMap[key] ?? key);
  return `${emoji} ${label}`.trim();
}

/**
 * Maps an impact level to a localised display string.
 * @param {string} level - Impact level: 'Green' | 'Moderate' | 'High'.
 * @param {TranslateFn} t - i18n translate function.
 * @returns {string}
 */
export function getImpactLevelText(level, t) {
  const defaults = {
    Green: 'Green (Low Impact)',
    Moderate: 'Moderate (Average)',
    High: 'High (Needs Action)',
  };
  if (!t) return defaults[level] ?? level;
  if (level === 'Green') return t('results.impact.green', defaults.Green);
  if (level === 'Moderate') return t('results.impact.moderate', defaults.Moderate);
  if (level === 'High') return t('results.impact.high', defaults.High);
  return level;
}
