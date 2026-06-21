import { useMemo } from 'react';
import tips from '../data/tips.json';

export function useDailyTip() {
  const tip = useMemo(() => {
    // Rotate based on day of year so each day shows a different tip
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const index = dayOfYear % tips.length;
    return tips[index];
  }, []);

  return tip;
}
