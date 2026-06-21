import { useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Award, Flame, Calendar, Trees, Zap, Droplets, Car, Lock, ShieldCheck, Trophy, Crown, ArrowLeft
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { useGamification } from '../../hooks/useGamification';
import { useLanguage } from '../../context/LanguageContext';
import './AchievementsPage.css';

export default function AchievementsPage() {
  const { gamificationState, currentLevel, leaderboard, badges, dailyChallenges, weeklyChallenges } = useGamification();
  const { t } = useLanguage();

  const unlockedSet = useMemo(() => {
    return new Set(gamificationState.unlockedBadges || []);
  }, [gamificationState.unlockedBadges]);

  const isBadgeUnlocked = useCallback((badgeId) => {
    return unlockedSet.has(badgeId);
  }, [unlockedSet]);

  // Memoized mapping of challenge category completions to avoid O(N*M) calculation in render loop
  const categoryCounts = useMemo(() => {
    const counts = { transport: 0, energy: 0, food: 0, water: 0, lifestyle: 0 };
    const history = gamificationState.completedChallengesHistory || [];
    history.forEach(hId => {
      const dChal = dailyChallenges.find(c => c.id === hId);
      if (dChal) {
        counts[dChal.category] = (counts[dChal.category] || 0) + 1;
        return;
      }
      const wChal = weeklyChallenges.find(c => c.id === hId);
      if (wChal) {
        counts[wChal.category] = (counts[wChal.category] || 0) + 1;
      }
    });
    return counts;
  }, [gamificationState.completedChallengesHistory, dailyChallenges, weeklyChallenges]);

  return (
    <div className="achievements-page page-enter">
      <Link to="/" className="back-home-btn" id="back-home-achievements">
        <ArrowLeft size={16} /> {t('common.back_to_home', 'Back to Home')}
      </Link>
      {/* Header */}
      <div className="achievements-page__header">
        <Award size={36} className="achievements-page__header-icon" />
        <div>
          <h1>{t('achievements.heading', 'Achievements')}</h1>
          <p className="achievements-page__subtitle">
            {t('achievements.desc.subtitle', 'Track your levels, badges, streaks, and community standing')}
          </p>
        </div>
      </div>

      {/* Grid: Level Progress & Streaks */}
      <div className="achievements-page__top-section">
        {/* Eco Level Progression Card */}
        <GlassCard className="achievements-page__level-card" glow>
          <h2>{t('achievements.level.title', 'Eco Levels Progression')}</h2>
          <div className="achievements-page__level-progress-container">
            <div className="achievements-page__level-nodes">
              <div className="achievements-page__level-node achievements-page__level-node--active">
                <span className="achievements-page__level-emoji">{currentLevel.icon}</span>
                <span className="achievements-page__level-name">{t(`levels.${currentLevel.id}.name`, currentLevel.name)}</span>
                <span className="achievements-page__level-point-lbl">{t('achievements.level.current_lbl', 'Current')}</span>
              </div>

              <div className="achievements-page__level-bar-track">
                <motion.div 
                  className="achievements-page__level-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentLevel.progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              {currentLevel.nextLevelName ? (
                <div className="achievements-page__level-node achievements-page__level-node--next">
                  <span className="achievements-page__level-emoji">{currentLevel.nextLevelIcon}</span>
                  <span className="achievements-page__level-name">{t(`levels.${currentLevel.nextLevelId}.name`, currentLevel.nextLevelName)}</span>
                  <span className="achievements-page__level-point-lbl">{t('achievements.level.next_lbl', 'Next Level')}</span>
                </div>
              ) : (
                <div className="achievements-page__level-node achievements-page__level-node--maxed">
                  <span className="achievements-page__level-emoji">🌎</span>
                  <span className="achievements-page__level-name">{t('achievements.level.maxed_name', 'Planet Protector')}</span>
                  <span className="achievements-page__level-point-lbl">{t('achievements.level.max_lbl', 'MAX')}</span>
                </div>
              )}
            </div>

            <div className="achievements-page__level-meta">
              <span className="achievements-page__level-total-points">
                🪙 <AnimatedCounter value={gamificationState.points} decimals={0} /> {t('achievements.level.total_points', 'Total Points')}
              </span>
              {currentLevel.nextLevelName ? (
                <span
                  className="achievements-page__level-points-needed"
                  dangerouslySetInnerHTML={{
                    __html: t('achievements.level.points_needed', 'Need <strong>{points}</strong> more points to reach <strong>{nextLevel}</strong>')
                      .replace('{points}', currentLevel.pointsNeeded)
                      .replace('{nextLevel}', t(`levels.${currentLevel.nextLevelId}.name`, currentLevel.nextLevelName))
                  }}
                />
              ) : (
                <span
                  className="achievements-page__level-points-needed"
                  dangerouslySetInnerHTML={{
                    __html: t('achievements.level.maxed_desc', 'You are at the maximum eco level! Excellent work! 🎉')
                  }}
                />
              )}
            </div>
          </div>
        </GlassCard>

        {/* Streaks Card */}
        <GlassCard className="achievements-page__streak-card">
          <h2>{t('achievements.streak.center', '🔥 Streak Center')}</h2>
          <div className="achievements-page__streak-grid">
            <div className="achievements-page__streak-item achievements-page__streak-item--daily">
              <div className="achievements-page__streak-icon-wrap">
                <Flame size={32} className="achievements-page__streak-icon achievements-page__streak-icon--fire" />
              </div>
              <div className="achievements-page__streak-details">
                <span className="achievements-page__streak-num">
                  <AnimatedCounter value={gamificationState.dailyStreak} decimals={0} />
                </span>
                <span className="achievements-page__streak-label">{t('achievements.daily.streak_lbl', 'Daily Streak (Days)')}</span>
              </div>
            </div>

            <div className="achievements-page__streak-item achievements-page__streak-item--weekly">
              <div className="achievements-page__streak-icon-wrap">
                <Calendar size={28} className="achievements-page__streak-icon achievements-page__streak-icon--calendar" />
              </div>
              <div className="achievements-page__streak-details">
                <span className="achievements-page__streak-num">
                  <AnimatedCounter value={gamificationState.weeklyStreak} decimals={0} />
                </span>
                <span className="achievements-page__streak-label">{t('achievements.weekly.streak_lbl', 'Weekly Streak (Weeks)')}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Cumulative Impact Showcase */}
      <section className="achievements-page__section">
        <h2>{t('achievements.impact.title', '🌳 Cumulative Carbon Impact')}</h2>
        <p className="achievements-page__section-subtitle">{t('achievements.impact.subtitle', 'The direct offset equivalent of all your completed eco-challenges')}</p>
        
        <div className="achievements-page__impact-grid">
          <GlassCard className="achievements-page__impact-card achievements-page__impact-card--trees">
            <div className="achievements-page__impact-header">
              <Trees size={24} className="achievements-page__impact-icon" />
              <span>{t('dashboard.trees.saved', 'Trees Saved')}</span>
            </div>
            <span className="achievements-page__impact-val">
              <AnimatedCounter value={gamificationState.impact.treesSaved} decimals={1} suffix={t('achievements.impact.trees_suffix', ' 🌳')} />
            </span>
            <p className="achievements-page__impact-desc">{t('achievements.impact.trees_desc', 'Equivalent in yearly CO₂ absorption of fully grown trees.')}</p>
          </GlassCard>

          <GlassCard className="achievements-page__impact-card achievements-page__impact-card--energy">
            <div className="achievements-page__impact-header">
              <Zap size={24} className="achievements-page__impact-icon" />
              <span>{t('dashboard.energy.saved.title', 'Energy Saved')}</span>
            </div>
            <span className="achievements-page__impact-val">
              <AnimatedCounter value={gamificationState.impact.energySavedKwh} decimals={1} suffix={t('achievements.impact.kwh_suffix', ' kWh')} />
            </span>
            <p className="achievements-page__impact-desc">{t('achievements.impact.energy_desc', 'Electricity conserved across household devices.')}</p>
          </GlassCard>

          <GlassCard className="achievements-page__impact-card achievements-page__impact-card--water">
            <div className="achievements-page__impact-header">
              <Droplets size={24} className="achievements-page__impact-icon" />
              <span>{t('dashboard.water.saved.title', 'Water Saved')}</span>
            </div>
            <span className="achievements-page__impact-val">
              <AnimatedCounter value={gamificationState.impact.waterSavedLiters} decimals={0} suffix={t('achievements.impact.liters_suffix', ' Liters')} />
            </span>
            <p className="achievements-page__impact-desc">{t('achievements.impact.water_desc', 'Conserved through shower and food consumption habit shifts.')}</p>
          </GlassCard>

          <GlassCard className="achievements-page__impact-card achievements-page__impact-card--driving">
            <div className="achievements-page__impact-header">
              <Car size={24} className="achievements-page__impact-icon" />
              <span>{t('achievements.impact.driving_title', 'Driving Reduced')}</span>
            </div>
            <span className="achievements-page__impact-val">
              <AnimatedCounter value={gamificationState.impact.drivingReducedKm} decimals={1} suffix={t('achievements.impact.km_suffix', ' km')} />
            </span>
            <p className="achievements-page__impact-desc">{t('achievements.impact.driving_desc', 'Equivalent personal car driving kilometers avoided.')}</p>
          </GlassCard>
        </div>
      </section>

      {/* Badges Gallery & Community Leaderboard */}
      <div className="achievements-page__bottom-grid">
        {/* Badges Gallery */}
        <section className="achievements-page__section achievements-page__badges-section">
          <h2>{t('achievements.badges.title', '🏅 Eco Badges')}</h2>
          <p className="achievements-page__section-subtitle">{t('achievements.badges.subtitle', 'Unlock badges by completing category-specific challenges')}</p>
          
          <div className="achievements-page__badges-grid">
            {badges.map((badge, idx) => {
              const unlocked = isBadgeUnlocked(badge.id);
              const completedCount = categoryCounts[badge.category] || 0;
              const progressPercent = Math.min(Math.round((completedCount / 3) * 100), 100);

              return (
                <GlassCard 
                  key={badge.id}
                  className={`achievements-page__badge-card ${unlocked ? 'achievements-page__badge-card--unlocked' : 'achievements-page__badge-card--locked'}`}
                  delay={idx * 0.05}
                >
                  <div className="achievements-page__badge-display" style={{ borderColor: unlocked ? badge.color : 'rgba(255, 255, 255, 0.05)' }}>
                    <span className="achievements-page__badge-emoji">{badge.icon}</span>
                    {!unlocked && (
                      <div className="achievements-page__badge-lock-overlay">
                        <Lock size={12} />
                      </div>
                    )}
                  </div>

                  <div className="achievements-page__badge-info">
                    <h3>{t(`badges.${badge.id}.name`, badge.name)}</h3>
                    <p>{t(`badges.${badge.id}.description`, badge.description)}</p>
                    
                    {/* Badge unlocks progression helper */}
                    {!unlocked ? (
                      <div className="achievements-page__badge-progress">
                        <span className="achievements-page__badge-progress-lbl">{t('challenges.progress.lbl', 'Progress')}: {completedCount}/3</span>
                        <div className="achievements-page__badge-progress-bar-track">
                          <div className="achievements-page__badge-progress-bar-fill" style={{ width: `${progressPercent}%`, backgroundColor: badge.color }} />
                        </div>
                      </div>
                    ) : (
                      <span className="achievements-page__badge-unlocked-lbl" style={{ color: badge.color }}>
                        <ShieldCheck size={12} /> {t('achievements.badges.unlocked', 'Unlocked')}
                      </span>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </section>

        {/* Local Leaderboard */}
        <section className="achievements-page__section achievements-page__leaderboard-section">
          <h2>{t('achievements.leaderboard.title', '🏆 Community Leaderboard')}</h2>
          <p className="achievements-page__section-subtitle">{t('achievements.leaderboard.subtitle', 'Compete with other local climate guardians')}</p>

          <GlassCard className="achievements-page__leaderboard-card">
            <div className="achievements-page__leaderboard-list">
              {leaderboard.map((player) => (
                <div 
                  key={player.id} 
                  className={`achievements-page__leaderboard-row ${player.isUser ? 'achievements-page__leaderboard-row--user' : ''}`}
                >
                  <div className="achievements-page__rank-col">
                    {player.rank === 1 ? (
                      <Crown size={18} className="achievements-page__crown-icon" />
                    ) : (
                      <span className="achievements-page__rank-number">{player.rank}</span>
                    )}
                  </div>
                  
                  <div className="achievements-page__player-avatar">
                    {player.avatar}
                  </div>

                  <div className="achievements-page__player-details">
                    <div className="achievements-page__player-row-main" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="achievements-page__player-name" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        {player.name} {player.isUser && <span className="achievements-page__user-tag" style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--color-primary-500)', color: 'var(--color-bg-primary)', textTransform: 'uppercase', fontWeight: 800 }}>{t('achievements.you.tag', 'You')}</span>}
                      </span>
                      {player.region && <span className="achievements-page__player-region" style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: '4px' }}>📍 {player.region}</span>}
                    </div>
                    <div className="achievements-page__player-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                      <span className="achievements-page__player-level" style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>{player.level}</span>
                      {player.streak > 0 && <span className="achievements-page__player-streak" style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700 }}>🔥 {player.streak}d streak</span>}
                      {player.badgesCount > 0 && <span className="achievements-page__player-badges-count" style={{ fontSize: '0.65rem', color: '#60a5fa', fontWeight: 700 }}>🏅 {player.badgesCount} badges</span>}
                    </div>
                  </div>

                  <div className="achievements-page__points-col">
                    🪙 {player.points} {t('challenges.points.lbl', 'pts')}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
