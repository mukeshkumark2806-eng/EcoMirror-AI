import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import badgesData from '../data/badges.json';

export function useAchievements() {
  const [state, setState] = useLocalStorage('gamification', {
    points: 120,
    dailyStreak: 3,
    weeklyStreak: 1,
    completedDailyIds: [],
    completedWeeklyIds: [],
    weeklyProgress: {},
    unlockedBadges: ['badge_first_step'],
    completedChallengesHistory: ['daily_plastic_free'],
    impact: {
      carbonSavedKg: 12.5,
      treesSaved: 0.6,
      energySavedKwh: 31.25,
      waterSavedLiters: 1875,
      drivingReducedKm: 62.5,
    }
  });

  const unlockedBadges = useMemo(() => {
    return (state.unlockedBadges || []).map(id => {
      const b = badgesData.find(badge => badge.id === id);
      return b ? { ...b, unlockedAt: new Date().toISOString() } : null;
    }).filter(Boolean);
  }, [state.unlockedBadges]);

  const lockedBadges = useMemo(() => {
    const unlockedIds = state.unlockedBadges || [];
    return badgesData.filter(b => !unlockedIds.includes(b.id));
  }, [state.unlockedBadges]);

  const unlockBadge = useCallback((badgeId) => {
    setState(prev => {
      if (prev.unlockedBadges.includes(badgeId)) return prev;
      return {
        ...prev,
        unlockedBadges: [...prev.unlockedBadges, badgeId],
      };
    });
    return badgesData.find(b => b.id === badgeId);
  }, [setState]);

  const updateStreak = useCallback(() => {
    setState(prev => {
      const newDailyStreak = prev.dailyStreak + 1;
      return {
        ...prev,
        dailyStreak: newDailyStreak,
      };
    });
  }, [setState]);

  const checkAchievements = useCallback(({ activitiesCount, completedChallenges, isOnboarded }) => {
    const newlyUnlocked = [];
    const unlockedIds = state.unlockedBadges || [];

    for (const badge of badgesData) {
      if (unlockedIds.includes(badge.id)) continue;

      let shouldUnlock = false;
      const { criteria } = badge;

      if (criteria.type === 'total_logs' && activitiesCount >= criteria.value) {
        shouldUnlock = true;
      } else if (criteria.type === 'onboarding_complete' && isOnboarded) {
        shouldUnlock = true;
      } else if (criteria.type === 'streak' && state.dailyStreak >= criteria.value) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        newlyUnlocked.push(badge);
      }
    }

    if (newlyUnlocked.length > 0) {
      setState(prev => ({
        ...prev,
        unlockedBadges: [...prev.unlockedBadges, ...newlyUnlocked.map(b => b.id)],
      }));
    }

    return newlyUnlocked;
  }, [state.unlockedBadges, state.dailyStreak, setState]);

  return {
    unlockedBadges,
    lockedBadges,
    unlockBadge,
    updateStreak,
    checkAchievements,
    streak: {
      current: state.dailyStreak,
      longest: Math.max(state.dailyStreak, 5),
      lastLogDate: null
    },
    allBadges: badgesData,
  };
}
