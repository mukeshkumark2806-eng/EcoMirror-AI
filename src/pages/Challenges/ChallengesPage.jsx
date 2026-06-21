import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, CheckCircle, Clock, Zap, ArrowDown, Sparkles, RefreshCw, CalendarRange, Filter, ArrowLeft
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Confetti from '../../components/ui/Confetti';
import { useGamification } from '../../hooks/useGamification';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import './ChallengesPage.css';

const CATEGORIES = [
  { id: 'all' },
  { id: 'transport' },
  { id: 'energy' },
  { id: 'food' },
  { id: 'water' },
  { id: 'lifestyle' }
];

export default function ChallengesPage() {
  const {
    gamificationState,
    currentLevel,
    completeDailyChallenge,
    logWeeklyChallengeProgress,
    mockNewDay,
    mockNewWeek,
    resetAllGamification,
    dailyChallenges,
    weeklyChallenges
  } = useGamification();

  const toast = useToast();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [showConfetti, setShowConfetti] = useState(false);

  // Filter daily and weekly challenges by active category
  const filteredDaily = useMemo(() => {
    return dailyChallenges.filter(
      c => activeCategory === 'all' || c.category === activeCategory
    );
  }, [dailyChallenges, activeCategory]);
  
  const filteredWeekly = useMemo(() => {
    return weeklyChallenges.filter(
      c => activeCategory === 'all' || c.category === activeCategory
    );
  }, [weeklyChallenges, activeCategory]);

  const getCategoryFilterLabel = useCallback((catId) => {
    const keyMap = {
      all: 'challenges.filter.all',
      transport: 'challenges.filter.transport',
      energy: 'challenges.filter.energy',
      food: 'challenges.filter.food',
      water: 'challenges.filter.water',
      lifestyle: 'challenges.filter.lifestyle',
    };
    const englishMap = {
      all: '🌍 All',
      transport: '🚲 Transportation',
      energy: '💡 Energy',
      food: '🥗 Food',
      water: '💧 Water',
      lifestyle: '🌱 Lifestyle',
    };
    return t(keyMap[catId], englishMap[catId]);
  }, [t]);

  const getDifficultyLabel = useCallback((diff) => {
    const keyMap = {
      easy: 'challenges.filter.easy',
      medium: 'challenges.filter.medium',
      hard: 'challenges.filter.hard',
    };
    const englishMap = {
      easy: '🟢 Easy',
      medium: '🟡 Medium',
      hard: '🔴 Hard',
    };
    return t(keyMap[diff], englishMap[diff]);
  }, [t]);

  const handleCompleteDaily = useCallback((id, title) => {
    const res = completeDailyChallenge(id);
    if (res.success) {
      setShowConfetti(true);
      const translatedTitle = t(`challenges.items.${id}.title`, title);
      toast.success(t('challenges.toast.daily_complete', "🎉 Completed: {title}! +{points} Eco Points!").replace('{title}', translatedTitle).replace('{points}', res.pointsEarned));
      
      if (res.newBadge) {
        setTimeout(() => {
          const badgeName = t(`badges.${res.newBadge.id}.name`, res.newBadge.name);
          toast.achievement(t('challenges.toast.badge_unlocked', "🏆 Unlocked Badge: {badgeName}! {badgeIcon}").replace('{badgeName}', badgeName).replace('{badgeIcon}', res.newBadge.icon));
        }, 1200);
      }
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [completeDailyChallenge, t, toast]);

  const handleLogWeekly = useCallback((id, title, daysRequired) => {
    const res = logWeeklyChallengeProgress(id);
    if (res.success) {
      const translatedTitle = t(`challenges.items.${id}.title`, title);
      if (res.isCompleted) {
        setShowConfetti(true);
        toast.success(t('challenges.toast.weekly_complete', "🏆 Weekly Goal Achieved: {title}! +{points} Eco Points!").replace('{title}', translatedTitle).replace('{points}', res.pointsEarned));
        if (res.newBadge) {
          setTimeout(() => {
            const badgeName = t(`badges.${res.newBadge.id}.name`, res.newBadge.name);
            toast.achievement(t('challenges.toast.badge_unlocked', "🏆 Unlocked Badge: {badgeName}! {badgeIcon}").replace('{badgeName}', badgeName).replace('{badgeIcon}', res.newBadge.icon));
          }, 1200);
        }
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        const currentProgress = (gamificationState.weeklyProgress[id] || 0) + 1;
        toast.success(t('challenges.toast.logged_weekly', "Logged day {progress}/{required} for {title}! Keep it up! ⚡").replace('{progress}', currentProgress).replace('{required}', daysRequired).replace('{title}', translatedTitle));
      }
    }
  }, [logWeeklyChallengeProgress, gamificationState.weeklyProgress, t, toast]);

  return (
    <div className="challenges-page page-enter">
      <Link to="/" className="back-home-btn" id="back-home-challenges">
        <ArrowLeft size={16} /> {t('common.back_to_home', 'Back to Home')}
      </Link>
      <Confetti active={showConfetti} />

      {/* Page Header */}
      <div className="challenges-page__header-container">
        <div className="challenges-page__header">
          <div className="challenges-page__title-group">
            <Trophy size={36} className="challenges-page__header-icon" />
            <div>
              <h1>{t('challenges.heading', 'Eco Challenges')}</h1>
              <p className="challenges-page__subtitle">
                {t('challenges.desc', 'Complete daily and weekly habits to boost your score and unlock rewards')}
              </p>
            </div>
          </div>
          
          {/* Quick Stats Panel */}
          <div className="challenges-page__stats-header">
            <div className="challenges-page__stat-header-item">
              <span className="challenges-page__stat-header-label">{t('challenges.points.lbl', 'Eco Points')}</span>
              <span className="challenges-page__stat-header-val">🪙 {gamificationState.points}</span>
            </div>
            <div className="challenges-page__stat-header-item">
              <span className="challenges-page__stat-header-label">{t('challenges.current_level', 'Current Level')}</span>
              <span className="challenges-page__stat-header-val">
                {currentLevel.icon} {t(`levels.${currentLevel.id}.name`, currentLevel.name)}
              </span>
            </div>
          </div>
        </div>

        {/* Demo Controller Utilities */}
        <div className="challenges-page__demo-controls">
          <span className="challenges-page__demo-tag">{t('challenges.demo.title', '🔧 Local Demo Toolset:')}</span>
          <button onClick={() => { mockNewDay(); toast.success(t('challenges.toast.mock_day_success', 'Mocked new day! Daily challenges reset.')); }} className="challenges-page__demo-btn">
            <RefreshCw size={12} /> {t('challenges.demo.reset_dailies', 'Reset Dailies')}
          </button>
          <button onClick={() => { mockNewWeek(); toast.success(t('challenges.toast.mock_week_success', 'Mocked new week! Weekly progress reset.')); }} className="challenges-page__demo-btn">
            <CalendarRange size={12} /> {t('challenges.demo.reset_weeklies', 'Reset Weeklies')}
          </button>
          <button onClick={() => { resetAllGamification(); toast.success(t('challenges.toast.reset_success', 'Progress reset to default.')); }} className="challenges-page__demo-btn challenges-page__demo-btn--reset">
            {t('challenges.demo.reset_all', 'Reset Everything')}
          </button>
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="challenges-page__filter-container">
        <span className="challenges-page__filter-title">
          <Filter size={14} /> {t('challenges.filter.title', 'Filter by Area:')}
        </span>
        <div className="challenges-page__filters">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`challenges-page__filter-btn ${activeCategory === category.id ? 'challenges-page__filter-btn--active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {getCategoryFilterLabel(category.id)}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Challenges */}
      <section className="challenges-page__section">
        <div className="challenges-page__section-header">
          <h2>{t('challenges.daily.title', '🌱 Daily Eco-Habits')}</h2>
          <span className="challenges-page__section-badge">{t('challenges.daily.completes_today', 'Completes Today')}</span>
        </div>
        
        <div className="challenges-page__grid">
          <AnimatePresence mode="popLayout">
            {filteredDaily.map((challenge, index) => {
              const isCompleted = gamificationState.completedDailyIds.includes(challenge.id);
              
              return (
                <GlassCard 
                  key={challenge.id} 
                  className={`challenges-page__card ${isCompleted ? 'challenges-page__card--completed' : ''}`}
                  delay={index * 0.05}
                  glow={!isCompleted}
                >
                  <div className="challenges-page__card-top">
                    <span className="challenges-page__card-emoji" role="img" aria-label={challenge.title}>
                      {challenge.emoji}
                    </span>
                    <div className="challenges-page__badge-group">
                      <span className="challenges-page__card-reward">
                        🪙 +{challenge.points} {t('challenges.points.suffix', 'pts')}
                      </span>
                      <span 
                        className="challenges-page__card-difficulty"
                        style={{ color: 'var(--color-text)', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      >
                        {getDifficultyLabel(challenge.difficulty)}
                      </span>
                    </div>
                  </div>

                  <div className="challenges-page__card-body">
                    <h3>{t(`challenges.items.${challenge.id}.title`, challenge.title)}</h3>
                    <p>{t(`challenges.items.${challenge.id}.description`, challenge.description)}</p>
                  </div>

                  <div className="challenges-page__card-footer">
                    <div className="challenges-page__impact-estimate">
                      <ArrowDown size={14} className="challenges-page__impact-icon" />
                      <span>-{challenge.carbonReduction} {t('challenges.carbon.lbl', 'kg CO₂')}</span>
                    </div>

                    <motion.button
                      whileHover={!isCompleted ? { scale: 1.03 } : {}}
                      whileTap={!isCompleted ? { scale: 0.97 } : {}}
                      className={`challenges-page__action-btn ${isCompleted ? 'challenges-page__action-btn--done' : ''}`}
                      onClick={() => handleCompleteDaily(challenge.id, challenge.title)}
                      disabled={isCompleted}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle size={16} /> {t('challenges.completed.btn', 'Completed')}
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} /> {t('challenges.complete_challenge.btn', 'Complete Challenge')}
                        </>
                      )}
                    </motion.button>
                  </div>
                </GlassCard>
              );
            })}
          </AnimatePresence>
          {filteredDaily.length === 0 && (
            <div className="challenges-page__empty">
              {t('challenges.empty.daily', 'No daily challenges in this category right now.')}
            </div>
          )}
        </div>
      </section>

      {/* Weekly Challenges */}
      <section className="challenges-page__section">
        <div className="challenges-page__section-header">
          <h2>{t('challenges.weekly.title', '📅 Weekly Eco-Challenges')}</h2>
          <span className="challenges-page__section-badge challenges-page__section-badge--weekly">{t('challenges.weekly.progression', 'Multi-Day Progression')}</span>
        </div>

        <div className="challenges-page__grid challenges-page__grid--weekly">
          <AnimatePresence mode="popLayout">
            {filteredWeekly.map((challenge, index) => {
              const isCompleted = gamificationState.completedWeeklyIds.includes(challenge.id);
              const loggedDays = gamificationState.weeklyProgress[challenge.id] || 0;
              const percent = Math.min(Math.round((loggedDays / challenge.daysRequired) * 100), 100);

              return (
                <GlassCard 
                  key={challenge.id} 
                  className={`challenges-page__card challenges-page__card--weekly ${isCompleted ? 'challenges-page__card--completed' : ''}`}
                  delay={index * 0.08}
                  glow={!isCompleted}
                >
                  <div className="challenges-page__card-top">
                    <span className="challenges-page__card-emoji" role="img" aria-label={challenge.title}>
                      {challenge.emoji}
                    </span>
                    <div className="challenges-page__badge-group">
                      <span className="challenges-page__card-reward">
                        🪙 +{challenge.points} {t('challenges.points.suffix', 'pts')}
                      </span>
                      <span 
                        className="challenges-page__card-difficulty"
                        style={{ color: 'var(--color-text)', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      >
                        {getDifficultyLabel(challenge.difficulty)}
                      </span>
                    </div>
                  </div>

                  <div className="challenges-page__card-body">
                    <h3>{t(`challenges.items.${challenge.id}.title`, challenge.title)}</h3>
                    <p>{t(`challenges.items.${challenge.id}.description`, challenge.description)}</p>
                    
                    {/* Progress Bar Container */}
                    <div className="challenges-page__progress-container">
                      <div className="challenges-page__progress-labels">
                        <span className="challenges-page__progress-text">
                          <Clock size={12} /> {t('challenges.progress.lbl', 'Progress')}: {loggedDays}/{challenge.daysRequired} {t('challenges.days.lbl', 'days')}
                        </span>
                        <span className="challenges-page__progress-percent">{percent}%</span>
                      </div>
                      <div className="challenges-page__progress-bar-track">
                        <motion.div 
                          className="challenges-page__progress-bar-fill" 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="challenges-page__card-footer">
                    <div className="challenges-page__impact-estimate">
                      <ArrowDown size={14} className="challenges-page__impact-icon" />
                      <span>-{challenge.carbonReduction} {t('challenges.carbon.lbl', 'kg CO₂')}</span>
                    </div>

                    <motion.button
                      whileHover={!isCompleted ? { scale: 1.03 } : {}}
                      whileTap={!isCompleted ? { scale: 0.97 } : {}}
                      className={`challenges-page__action-btn ${isCompleted ? 'challenges-page__action-btn--done' : ''} ${!isCompleted ? 'challenges-page__action-btn--log' : ''}`}
                      onClick={() => handleLogWeekly(challenge.id, challenge.title, challenge.daysRequired)}
                      disabled={isCompleted}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle size={16} /> {t('challenges.week_completed.btn', 'Week Completed')}
                        </>
                      ) : (
                        <>
                          <Zap size={14} /> {t('challenges.log.btn', 'Log Progress (+1 Day)')}
                        </>
                      )}
                    </motion.button>
                  </div>
                </GlassCard>
              );
            })}
          </AnimatePresence>
          {filteredWeekly.length === 0 && (
            <div className="challenges-page__empty">
              {t('challenges.empty.weekly', 'No weekly challenges in this category right now.')}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
