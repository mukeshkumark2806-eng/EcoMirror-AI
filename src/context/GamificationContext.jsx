/**
 * @fileoverview GamificationContext — unified state provider for streaks, points, levels, and badges.
 * Combines useGamification and useAchievements states to avoid state sync drift.
 * @module context/GamificationContext
 */

import { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUser } from './UserContext';
import badgesData from '../data/badges.json';

const GamificationContext = createContext(null);

export const DAILY_CHALLENGES = [
  {
    id: 'daily_plastic_free',
    title: 'Plastic-Free Day',
    emoji: '🌱',
    difficulty: 'easy',
    category: 'lifestyle',
    points: 15,
    carbonReduction: 1.2,
    description: 'Avoid buying or using single-use plastics today.'
  },
  {
    id: 'daily_public_transport',
    title: 'Public Transport Day',
    emoji: '🚲',
    difficulty: 'medium',
    category: 'transport',
    points: 25,
    carbonReduction: 4.5,
    description: 'Commute using bus, train, or bicycle instead of a personal car.'
  },
  {
    id: 'daily_energy_saver',
    title: 'Energy Saver Day',
    emoji: '💡',
    difficulty: 'easy',
    category: 'energy',
    points: 15,
    carbonReduction: 1.8,
    description: 'Turn off standby appliances and turn off lights in empty rooms.'
  },
  {
    id: 'daily_five_min_shower',
    title: '5-Minute Shower Challenge',
    emoji: '🚿',
    difficulty: 'easy',
    category: 'water',
    points: 20,
    carbonReduction: 2.2,
    description: 'Keep your shower under 5 minutes to save water and heating energy.'
  },
  {
    id: 'daily_meat_free',
    title: 'Meat-Free Meal Day',
    emoji: '🥗',
    difficulty: 'easy',
    category: 'food',
    points: 20,
    carbonReduction: 2.5,
    description: 'Enjoy delicious vegetarian or vegan meals for the entire day.'
  }
];

export const WEEKLY_CHALLENGES = [
  {
    id: 'weekly_car_free_weekend',
    title: 'Car-Free Weekend',
    emoji: '🚗',
    difficulty: 'medium',
    category: 'transport',
    points: 50,
    carbonReduction: 15.0,
    daysRequired: 2,
    description: 'Do not use a car for any trips over Saturday and Sunday.'
  },
  {
    id: 'weekly_reduce_electricity',
    title: 'Reduce Electricity Usage',
    emoji: '⚡',
    difficulty: 'medium',
    category: 'energy',
    points: 40,
    carbonReduction: 12.0,
    daysRequired: 7,
    description: 'Cut down power usage by avoiding AC or unplugging inactive items daily.'
  },
  {
    id: 'weekly_water_conservation',
    title: 'Water Conservation Week',
    emoji: '💧',
    difficulty: 'medium',
    category: 'water',
    points: 40,
    carbonReduction: 10.0,
    daysRequired: 7,
    description: 'Use water-saving techniques like reusing wash water and fixing minor leaks for 7 days.'
  }
];

export const BADGES = [
  {
    id: 'badge_green_traveler',
    name: 'Green Traveler',
    icon: '🚲',
    category: 'transport',
    description: 'Complete 3 Transportation challenges',
    rarity: 'uncommon',
    color: '#60a5fa'
  },
  {
    id: 'badge_energy_saver_title',
    name: 'Energy Saver',
    icon: '💡',
    category: 'energy',
    description: 'Complete 3 Energy challenges',
    rarity: 'uncommon',
    color: '#facc15'
  },
  {
    id: 'badge_water_guardian',
    name: 'Water Guardian',
    icon: '💧',
    category: 'water',
    description: 'Complete 3 Water challenges',
    rarity: 'uncommon',
    color: '#38bdf8'
  },
  {
    id: 'badge_sustainable_eater',
    name: 'Sustainable Eater',
    icon: '🥗',
    category: 'food',
    description: 'Complete 3 Food challenges',
    rarity: 'uncommon',
    color: '#34d399'
  }
];

export const LEVELS = [
  { id: 'seed', name: 'Seed', icon: '🌱', minPoints: 0, maxPoints: 99 },
  { id: 'sapling', name: 'Sapling', icon: '🌿', minPoints: 100, maxPoints: 299 },
  { id: 'tree', name: 'Tree', icon: '🌳', minPoints: 300, maxPoints: 599 },
  { id: 'forest_guardian', name: 'Forest Guardian', icon: '🌲', minPoints: 600, maxPoints: 999 },
  { id: 'planet_protector', name: 'Planet Protector', icon: '🌎', minPoints: 1000, maxPoints: Infinity }
];

export function getLevelDetails(points) {
  const currentLevelIndex = LEVELS.findIndex(
    (lvl) => points >= lvl.minPoints && points <= lvl.maxPoints
  );
  const currentLevelIndexValid = currentLevelIndex !== -1 ? currentLevelIndex : 0;
  const currentLevel = LEVELS[currentLevelIndexValid];
  const nextLevel = currentLevelIndexValid < LEVELS.length - 1 ? LEVELS[currentLevelIndexValid + 1] : null;
  
  let progressPercentage = 100;
  let pointsNeeded = 0;
  if (nextLevel) {
    const range = nextLevel.minPoints - currentLevel.minPoints;
    const progress = points - currentLevel.minPoints;
    progressPercentage = Math.min(Math.round((progress / range) * 100), 100);
    pointsNeeded = nextLevel.minPoints - points;
  }
  
  return {
    id: currentLevel.id,
    name: currentLevel.name,
    icon: currentLevel.icon,
    points,
    progressPercentage,
    pointsNeeded,
    nextLevelId: nextLevel ? nextLevel.id : null,
    nextLevelName: nextLevel ? nextLevel.name : null,
    nextLevelIcon: nextLevel ? nextLevel.icon : null,
  };
}

const INITIAL_STATE = {
  points: 0,
  dailyStreak: 0,
  weeklyStreak: 0,
  completedDailyIds: [],
  completedWeeklyIds: [],
  weeklyProgress: {},
  unlockedBadges: [],
  completedChallengesHistory: [],
  impact: {
    carbonSavedKg: 0,
    treesSaved: 0,
    energySavedKwh: 0,
    waterSavedLiters: 0,
    drivingReducedKm: 0,
  }
};

const REGIONS = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'London', 'California', 'Tokyo', 'Berlin', 'Sydney', 'New York'];
const FIRST_NAMES = ['Aarav', 'Vihaan', 'Aditya', 'Siddharth', 'Ishaan', 'Rahul', 'Arjun', 'Aanya', 'Diya', 'Ananya', 'Riya', 'Kiara', 'Kabir', 'Zoya', 'Nikhil', 'Dev', 'Tara', 'Rohan', 'Sneha', 'Meera', 'Vikram', 'Priya', 'Karan', 'Aditi', 'Amit', 'Neha', 'Sunil', 'Vijay', 'Alok', 'Deepak', 'Sanjay', 'Rajesh', 'Suresh', 'Anil', 'John', 'Emma', 'Sarah', 'Alex', 'David', 'Sophia'];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Reddy', 'Rao', 'Iyer', 'Nair', 'Singh', 'Kumar', 'Mehta', 'Joshi', 'Das', 'Sen', 'Pillai', 'Smith', 'Jones', 'Miller', 'Davis', 'Wilson'];
const AVATARS = ['🍀', '🦊', '🦉', '🦁', '🐼', '🐨', '🐯', '🐰', '🐻', '🐵', '🦅', '🦄', '🐝', '🐞', '🐢', '🦖'];

function generateMockPlayers() {
  const players = [];
  let seed = 42;
  function random() {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  for (let i = 1; i <= 75; i++) {
    const fn = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
    const name = `${fn} ${ln}`;
    const region = REGIONS[Math.floor(random() * REGIONS.length)];
    const points = Math.floor(100 + random() * 1500); // 100 to 1600 points
    const avatar = AVATARS[Math.floor(random() * AVATARS.length)];
    const streak = Math.floor(random() * 25);
    const badgesCount = Math.floor(random() * 5);
    
    let levelName = 'Seed';
    if (points >= 1000) levelName = 'Planet Protector';
    else if (points >= 600) levelName = 'Forest Guardian';
    else if (points >= 300) levelName = 'Tree';
    else if (points >= 100) levelName = 'Sapling';

    players.push({
      id: `p_${i}`,
      name,
      points,
      level: levelName,
      region,
      avatar,
      streak,
      badgesCount,
      isUser: false
    });
  }
  return players;
}

const MOCK_PLAYERS = generateMockPlayers();

export function GamificationProvider({ children }) {
  const [state, setState] = useLocalStorage('gamification', INITIAL_STATE);
  const { user } = useUser();

  const currentLevel = useMemo(() => {
    return getLevelDetails(state.points);
  }, [state.points]);

  const leaderboard = useMemo(() => {
    const youObj = {
      id: 'you',
      name: user.name || 'EcoExplorer',
      points: state.points,
      level: getLevelDetails(state.points).name,
      isUser: true,
      avatar: '👤',
      region: user.location || 'Local',
      streak: state.dailyStreak,
      badgesCount: state.unlockedBadges.length
    };

    const allPlayers = [youObj, ...MOCK_PLAYERS];
    allPlayers.sort((a, b) => b.points - a.points);
    return allPlayers.map((player, index) => ({
      ...player,
      rank: index + 1
    }));
  }, [state.points, state.dailyStreak, state.unlockedBadges, user.name, user.location]);

  const completeDailyChallenge = useCallback((challengeId) => {
    const challenge = DAILY_CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) return { success: false };

    let unlockedANewBadge = null;

    setState(prev => {
      if (prev.completedDailyIds.includes(challengeId)) return prev;

      const newCompletedDaily = [...prev.completedDailyIds, challengeId];
      const newHistory = [...prev.completedChallengesHistory, challengeId];
      const newPoints = prev.points + challenge.points;

      const newCarbonSaved = prev.impact.carbonSavedKg + challenge.carbonReduction;
      const newTrees = Math.round((newCarbonSaved / 20) * 10) / 10;
      const newEnergy = Math.round((newCarbonSaved * 2.5) * 10) / 10;
      const newWater = Math.round(newCarbonSaved * 150);
      const newDriving = Math.round((newCarbonSaved * 5) * 10) / 10;

      let newDailyStreak = prev.dailyStreak;
      if (prev.completedDailyIds.length === 0) {
        newDailyStreak = prev.dailyStreak + 1;
      }

      // Check badge unlocks
      const categoryCount = newHistory.filter(hId => {
        const dChal = DAILY_CHALLENGES.find(c => c.id === hId);
        const wChal = WEEKLY_CHALLENGES.find(c => c.id === hId);
        return (dChal && dChal.category === challenge.category) || (wChal && wChal.category === challenge.category);
      }).length;

      const newUnlockedBadges = [...prev.unlockedBadges];
      const targetBadge = BADGES.find(b => b.category === challenge.category);
      if (targetBadge && categoryCount >= 3 && !prev.unlockedBadges.includes(targetBadge.id)) {
        newUnlockedBadges.push(targetBadge.id);
        unlockedANewBadge = targetBadge;
      }

      return {
        ...prev,
        points: newPoints,
        completedDailyIds: newCompletedDaily,
        completedChallengesHistory: newHistory,
        dailyStreak: newDailyStreak,
        unlockedBadges: newUnlockedBadges,
        impact: {
          carbonSavedKg: Math.round(newCarbonSaved * 10) / 10,
          treesSaved: newTrees,
          energySavedKwh: newEnergy,
          waterSavedLiters: newWater,
          drivingReducedKm: newDriving,
        }
      };
    });

    // Read the *updated* category counts safely inside caller or calculate from prev parameters
    // In this callback, we need to return whether a badge was unlocked.
    // Instead of relying on `state` inside this execution tick, we calculate it based on prev values.
    const preCount = state.completedChallengesHistory.filter(hId => {
      const dChal = DAILY_CHALLENGES.find(c => c.id === hId);
      const wChal = WEEKLY_CHALLENGES.find(c => c.id === hId);
      return (dChal && dChal.category === challenge.category) || (wChal && wChal.category === challenge.category);
    }).length;
    const postCount = preCount + 1;
    const targetBadge = BADGES.find(b => b.category === challenge.category);
    if (targetBadge && postCount >= 3 && !state.unlockedBadges.includes(targetBadge.id)) {
      unlockedANewBadge = targetBadge;
    }

    return { success: true, pointsEarned: challenge.points, newBadge: unlockedANewBadge };
  }, [state, setState]);

  const logWeeklyChallengeProgress = useCallback((challengeId) => {
    const challenge = WEEKLY_CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) return { success: false };

    let isCompleted = false;
    let unlockedANewBadge = null;

    setState(prev => {
      if (prev.completedWeeklyIds.includes(challengeId)) return prev;

      const currentProgress = prev.weeklyProgress[challengeId] || 0;
      const newProgressValue = currentProgress + 1;
      const newWeeklyProgress = { ...prev.weeklyProgress, [challengeId]: newProgressValue };

      let newPoints = prev.points;
      let newCompletedWeekly = [...prev.completedWeeklyIds];
      let newHistory = [...prev.completedChallengesHistory];
      let newCarbonSaved = prev.impact.carbonSavedKg;
      let newWeeklyStreak = prev.weeklyStreak;
      let newUnlockedBadges = [...prev.unlockedBadges];

      if (newProgressValue >= challenge.daysRequired) {
        isCompleted = true;
        newCompletedWeekly.push(challengeId);
        newHistory.push(challengeId);
        newPoints += challenge.points;
        newCarbonSaved += challenge.carbonReduction;
        newWeeklyStreak += 1;

        // Check badge unlocks
        const categoryCount = newHistory.filter(hId => {
          const dChal = DAILY_CHALLENGES.find(c => c.id === hId);
          const wChal = WEEKLY_CHALLENGES.find(c => c.id === hId);
          return (dChal && dChal.category === challenge.category) || (wChal && wChal.category === challenge.category);
        }).length;

        const targetBadge = BADGES.find(b => b.category === challenge.category);
        if (targetBadge && categoryCount >= 3 && !prev.unlockedBadges.includes(targetBadge.id)) {
          newUnlockedBadges.push(targetBadge.id);
        }
      }

      const newTrees = Math.round((newCarbonSaved / 20) * 10) / 10;
      const newEnergy = Math.round((newCarbonSaved * 2.5) * 10) / 10;
      const newWater = Math.round(newCarbonSaved * 150);
      const newDriving = Math.round((newCarbonSaved * 5) * 10) / 10;

      return {
        ...prev,
        points: newPoints,
        completedWeeklyIds: newCompletedWeekly,
        weeklyProgress: newWeeklyProgress,
        completedChallengesHistory: newHistory,
        weeklyStreak: newWeeklyStreak,
        unlockedBadges: newUnlockedBadges,
        impact: {
          carbonSavedKg: Math.round(newCarbonSaved * 10) / 10,
          treesSaved: newTrees,
          energySavedKwh: newEnergy,
          waterSavedLiters: newWater,
          drivingReducedKm: newDriving,
        }
      };
    });

    const currentProgress = state.weeklyProgress[challengeId] || 0;
    if (currentProgress + 1 >= challenge.daysRequired) {
      isCompleted = true;
      const newHistory = [...state.completedChallengesHistory, challengeId];
      const categoryCount = newHistory.filter(hId => {
        const dChal = DAILY_CHALLENGES.find(c => c.id === hId);
        const wChal = WEEKLY_CHALLENGES.find(c => c.id === hId);
        return (dChal && dChal.category === challenge.category) || (wChal && wChal.category === challenge.category);
      }).length;
      const targetBadge = BADGES.find(b => b.category === challenge.category);
      if (targetBadge && categoryCount >= 3 && !state.unlockedBadges.includes(targetBadge.id)) {
        unlockedANewBadge = targetBadge;
      }
    }

    return { success: true, isCompleted, pointsEarned: isCompleted ? challenge.points : 0, newBadge: unlockedANewBadge };
  }, [state, setState]);

  const mockNewDay = useCallback(() => {
    setState(prev => ({
      ...prev,
      completedDailyIds: [],
    }));
  }, [setState]);

  const mockNewWeek = useCallback(() => {
    setState(prev => ({
      ...prev,
      completedWeeklyIds: [],
      weeklyProgress: {},
    }));
  }, [setState]);

  const resetAllGamification = useCallback(() => {
    setState(INITIAL_STATE);
  }, [setState]);

  const unlockedBadges = useMemo(() => {
    const unlockedIds = state.unlockedBadges || [];
    return unlockedIds.map(id => {
      const b = badgesData.find(badge => badge.id === id) || BADGES.find(badge => badge.id === id);
      return b ? { ...b, unlockedAt: new Date().toISOString() } : null;
    }).filter(Boolean);
  }, [state.unlockedBadges]);

  const lockedBadges = useMemo(() => {
    const unlockedIds = state.unlockedBadges || [];
    const all = [...badgesData, ...BADGES];
    return all.filter(b => !unlockedIds.includes(b.id));
  }, [state.unlockedBadges]);

  const unlockBadge = useCallback((badgeId) => {
    setState(prev => {
      if (prev.unlockedBadges.includes(badgeId)) return prev;
      return {
        ...prev,
        unlockedBadges: [...prev.unlockedBadges, badgeId],
      };
    });
    return badgesData.find(b => b.id === badgeId) || BADGES.find(b => b.id === badgeId);
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

  return (
    <GamificationContext.Provider value={{
      state,
      setState,
      currentLevel,
      leaderboard,
      completeDailyChallenge,
      logWeeklyChallengeProgress,
      mockNewDay,
      mockNewWeek,
      resetAllGamification,
      unlockedBadges,
      lockedBadges,
      unlockBadge,
      updateStreak,
      checkAchievements,
      DAILY_CHALLENGES,
      WEEKLY_CHALLENGES,
      BADGES,
      LEVELS,
      allBadges: [...badgesData, ...BADGES]
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamificationState() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamificationState must be used within a GamificationProvider');
  }
  return context;
}
