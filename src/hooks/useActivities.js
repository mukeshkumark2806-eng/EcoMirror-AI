import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useCarbonEngine } from './useCarbonEngine';

export function useActivities() {
  const [activities, setActivities] = useLocalStorage('activities', []);
  const engine = useCarbonEngine();

  const addActivity = useCallback((activity) => {
    const now = new Date();
    const newActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date: now.toISOString().split('T')[0],
      timestamp: now.toISOString(),
      carbonKg: engine.calculate(activity.category, activity.type, activity.value),
      ...activity,
    };
    setActivities(prev => [newActivity, ...prev]);
    return newActivity;
  }, [setActivities, engine]);

  const removeActivity = useCallback((id) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  }, [setActivities]);

  const getActivitiesByDate = useCallback((date) => {
    return activities.filter(a => a.date === date);
  }, [activities]);

  const getActivitiesByCategory = useCallback((category) => {
    return activities.filter(a => a.category === category);
  }, [activities]);

  const getRecentActivities = useCallback((count = 10) => {
    return activities.slice(0, count);
  }, [activities]);

  const getDailyTotal = useCallback((date) => {
    return engine.dailyTotal(activities, date);
  }, [activities, engine]);

  const getWeeklyData = useCallback(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayActivities = activities.filter(a => a.date === dateStr);
      const totalCarbon = dayActivities.reduce((sum, a) => sum + (a.carbonKg || 0), 0);
      data.push({
        date: dateStr,
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        carbonKg: Math.round(totalCarbon * 10) / 10,
        count: dayActivities.length,
      });
    }
    return data;
  }, [activities]);

  const getTotalCarbon = useCallback(() => {
    return Math.round(activities.reduce((sum, a) => sum + (a.carbonKg || 0), 0) * 10) / 10;
  }, [activities]);

  const getCategoryBreakdown = useCallback(() => {
    return engine.categoryBreakdown(activities);
  }, [activities, engine]);

  return {
    activities,
    addActivity,
    removeActivity,
    getActivitiesByDate,
    getActivitiesByCategory,
    getRecentActivities,
    getDailyTotal,
    getWeeklyData,
    getTotalCarbon,
    getCategoryBreakdown,
  };
}
