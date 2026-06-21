import React, { useContext, useEffect } from 'react';
import { LeaderboardContext } from '../../context/LeaderboardContext';
import './Leaderboard.css';

export default function Leaderboard() {
  const { topTen, myRank, setUserId } = useContext(LeaderboardContext);

  // Assuming user authentication provides an ID; placeholder for demo
  useEffect(() => {
    // TODO: replace with real user ID from auth context
    const fakeUserId = 'you';
    setUserId(fakeUserId);
  }, [setUserId]);

  return (
    <section className="leaderboard" aria-labelledby="leaderboard-title">
      <h2 id="leaderboard-title" className="sr-only">Global Leaderboard</h2>
      <div className="my-rank" aria-label="My Rank">
        <p>Your Rank: <strong>{myRank ?? '—'}</strong></p>
      </div>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">User</th>
            <th scope="col">Points</th>
            <th scope="col">Eco Score</th>
            <th scope="col">Badges</th>
            <th scope="col">Streak</th>
          </tr>
        </thead>
        <tbody>
          {topTen.map((user, idx) => (
            <tr key={user.id} className={user.id === 'you' ? 'current-user' : ''}>
              <td>{idx + 1}</td>
              <td>{user.username ?? user.name}</td>
              <td>{user.points}</td>
              <td>{user.eco_score ?? '—'}</td>
              <td>{user.badges?.length ?? user.badgesCount ?? 0}</td>
              <td>{user.streak}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
