import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';

const LeaderboardContext = createContext();

/** Compute weighted score for ranking */
const computeWeightedScore = profile => {
  const pointsScore = profile.points ?? 0;
  const ecoScore = profile.eco_score ?? 0;
  const badgesCount = profile.badges ? profile.badges.length : 0;
  // Weighting: 70% points, 20% ecoScore, 10% badges
  return pointsScore * 0.7 + ecoScore * 0.2 + badgesCount * 0.1;
};

export const LeaderboardProvider = ({ children }) => {
  const [topTen, setTopTen] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [userId, setUserId] = useState(null);

  // Subscribe to realtime changes on the profiles table
  useEffect(() => {
    const channel = supabase.channel('public:profiles').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'profiles',
    }, payload => {
      // Re-fetch on any change
      fetchLeaderboard();
      if (userId) fetchMyRank();
    }).subscribe();

    fetchLeaderboard();
    if (userId) fetchMyRank();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchLeaderboard = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, points, eco_score, badges, region, streak')
      .order('points', { ascending: false }); // initial order, will re‑sort below
    if (error) {
      console.error('Leaderboard fetch error', error);
      return;
    }
    // Compute weighted scores and sort
    const withScore = data.map(p => ({ ...p, weightedScore: computeWeightedScore(p) }));
    const sorted = withScore.sort((a, b) => b.weightedScore - a.weightedScore);
    setTopTen(sorted.slice(0, 10));
  }, []);

  const fetchMyRank = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, points, eco_score, badges')
      .order('points', { ascending: false });
    if (error) {
      console.error('Rank fetch error', error);
      return;
    }
    const withScore = data.map(p => ({ ...p, weightedScore: computeWeightedScore(p) }));
    const sorted = withScore.sort((a, b) => b.weightedScore - a.weightedScore);
    const index = sorted.findIndex(u => u.id === userId);
    setMyRank(index >= 0 ? index + 1 : null);
  }, [userId]);

  const updatePoints = async (increment = 1) => {
    if (!userId) return;
    const { error } = await supabase
      .from('profiles')
      .update({ points: supabase.rpc('increment_points', { inc: increment }) })
      .eq('id', userId);
    if (error) console.error('Failed to update points', error);
  };

  return (
    <LeaderboardContext.Provider value={{ topTen, myRank, setUserId, updatePoints }}>
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = () => useContext(LeaderboardContext);
