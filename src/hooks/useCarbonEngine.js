import { useMemo } from 'react';
import emissionFactors from '../data/emissionFactors.json';

export function useCarbonEngine() {
  const engine = useMemo(() => ({
    /**
     * Calculate CO₂ emissions for a single activity
     */
    calculate(category, type, value) {
      const factor = emissionFactors[category]?.[type]?.factor ?? 0;
      return Math.round(value * factor * 100) / 100;
    },

    /**
     * Get emission factor info for an activity type
     */
    getFactor(category, type) {
      return emissionFactors[category]?.[type] ?? null;
    },

    /**
     * Get all activity types for a category
     */
    getActivities(category) {
      const cat = emissionFactors[category];
      if (!cat) return [];
      return Object.entries(cat).map(([key, val]) => ({
        key,
        ...val,
      }));
    },

    /**
     * Get all categories
     */
    getCategories() {
      return Object.keys(emissionFactors);
    },

    /**
     * Calculate daily total from an array of activities
     */
    dailyTotal(activities, date) {
      return activities
        .filter(a => a.date === date)
        .reduce((sum, a) => sum + (a.carbonKg || 0), 0);
    },

    /**
     * Calculate category breakdown from activities
     */
    categoryBreakdown(activities) {
      const totals = { transport: 0, food: 0, energy: 0, shopping: 0 };
      activities.forEach(a => {
        if (totals[a.category] !== undefined) {
          totals[a.category] += a.carbonKg || 0;
        }
      });
      const total = Object.values(totals).reduce((s, v) => s + v, 0);
      if (total === 0) return { transport: 25, food: 25, energy: 25, shopping: 25 };
      const breakdown = {};
      for (const [key, val] of Object.entries(totals)) {
        breakdown[key] = Math.round((val / total) * 100);
      }
      return breakdown;
    },

    /**
     * Calculate eco score (0-100) based on daily carbon kg
     * Lower carbon = higher score
     */
    calculateEcoScore(dailyCarbonKg) {
      // Average person: ~12.9 kg/day globally
      // Sustainable target: ~5.5 kg/day
      // Score 100 = 0 kg, Score 0 = 30+ kg
      const score = Math.max(0, Math.min(100, Math.round(100 - (dailyCarbonKg / 30) * 100)));
      return score;
    },

    /**
     * Calculate initial eco score from quiz answers
     */
    scoreFromQuiz(quiz) {
      const impactScores = {
        transport: { car_daily: 15, car_weekly: 35, public_transit: 65, bike: 90, walk: 95 },
        diet: { heavy_meat: 10, omnivore: 35, pescatarian: 55, vegetarian: 75, vegan: 95 },
        housing: { large_house: 20, small_house: 45, apartment: 70, shared: 85 },
        energy: { fossil: 15, mixed: 40, renewable: 75, solar: 95 },
        shopping: { frequent: 15, moderate: 45, minimal: 75, secondhand: 90 },
        travel: { frequent: 10, occasional: 45, rare: 75, never: 95 },
      };

      let total = 0;
      let count = 0;
      for (const [key, value] of Object.entries(quiz)) {
        if (impactScores[key]?.[value] !== undefined) {
          total += impactScores[key][value];
          count++;
        }
      }
      return count > 0 ? Math.round(total / count) : 50;
    },

    /**
     * Estimate daily carbon from quiz answers (kg)
     */
    dailyCarbonFromQuiz(quiz) {
      const estimates = {
        transport: { car_daily: 8.5, car_weekly: 4.0, public_transit: 1.5, bike: 0, walk: 0 },
        diet: { heavy_meat: 9.0, omnivore: 5.5, pescatarian: 4.0, vegetarian: 3.0, vegan: 1.8 },
        housing: { large_house: 6.0, small_house: 3.5, apartment: 2.0, shared: 1.5 },
        energy: { fossil: 5.0, mixed: 3.0, renewable: 1.0, solar: 0.5 },
        shopping: { frequent: 4.0, moderate: 2.0, minimal: 0.8, secondhand: 0.3 },
        travel: { frequent: 3.0, occasional: 1.0, rare: 0.3, never: 0 },
      };

      let total = 0;
      for (const [key, value] of Object.entries(quiz)) {
        total += estimates[key]?.[value] ?? 0;
      }
      return Math.round(total * 10) / 10;
    },
  }), []);

  return engine;
}
