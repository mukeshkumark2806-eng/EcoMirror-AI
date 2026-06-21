import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, TreePine, Wind, Droplets, Factory, ArrowLeft } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { useEcoScore } from '../../hooks/useEcoScore';
import { useActivities } from '../../hooks/useActivities';
import { useCarbonEngine } from '../../hooks/useCarbonEngine';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import './MirrorPage.css';

const SCENARIOS = [
  { key: 'meatless', label: 'Go meatless 3x/week', savingsKg: 5.4, category: 'food', icon: '🥗' },
  { key: 'bike', label: 'Bike to work 2x/week', savingsKg: 3.4, category: 'transport', icon: '🚲' },
  { key: 'unplug', label: 'Unplug standby devices', savingsKg: 1.2, category: 'energy', icon: '🔌' },
  { key: 'secondhand', label: 'Buy second-hand only', savingsKg: 4.0, category: 'shopping', icon: '♻️' },
  { key: 'transit', label: 'Take public transit', savingsKg: 6.0, category: 'transport', icon: '🚆' },
  { key: 'solar', label: 'Switch to solar energy', savingsKg: 8.0, category: 'energy', icon: '☀️' },
];

export default function MirrorPage() {
  const { score, categoryBreakdown } = useEcoScore();
  const { user } = useUser();
  const engine = useCarbonEngine();
  const { t } = useLanguage();
  const [activeScenarios, setActiveScenarios] = useState([]);

  const currentDailyCarbon = useMemo(() => {
    return engine.dailyCarbonFromQuiz(user.quiz || {});
  }, [user.quiz, engine]);

  const totalSavings = useMemo(() => {
    return activeScenarios.reduce((sum, key) => {
      const scenario = SCENARIOS.find(s => s.key === key);
      return sum + (scenario?.savingsKg || 0);
    }, 0);
  }, [activeScenarios]);

  const mirrorCarbon = useMemo(() => Math.max(0, currentDailyCarbon - totalSavings), [currentDailyCarbon, totalSavings]);
  const mirrorScore = useMemo(() => engine.calculateEcoScore(mirrorCarbon), [engine, mirrorCarbon]);
  const treesEquivalent = useMemo(() => Math.round((totalSavings * 365) / 22), [totalSavings]);
  const yearlyReduction = useMemo(() => Math.round(totalSavings * 365), [totalSavings]);

  const toggleScenario = useCallback((key) => {
    setActiveScenarios(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }, []);

  // Calculate visual intensity (0–1) for the mirror sides
  const currentIntensity = useMemo(() => Math.min(1, currentDailyCarbon / 25), [currentDailyCarbon]);
  const mirrorIntensity = useMemo(() => Math.min(1, mirrorCarbon / 25), [mirrorCarbon]);

  return (
    <div className="mirror page-enter">
      <Link to="/" className="back-home-btn" id="back-home-mirror">
        <ArrowLeft size={16} /> {t('common.back_to_home', 'Back to Home')}
      </Link>
      <div className="mirror__header">
        <Sparkles size={24} className="mirror__header-icon" />
        <h1>{t('brand.name', 'EcoMirror')}</h1>
        <p className="mirror__subtitle">{t('mirror.subtitle', 'See what changes could look like')}</p>
      </div>

      {/* Split view */}
      <div className="mirror__split">
        {/* Left: Current */}
        <motion.div
          className="mirror__panel mirror__panel--current"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mirror__panel-label">{t('mirror.current_world', 'Your World Today')}</div>
          <div className="mirror__visual" style={{ '--pollution': currentIntensity }}>
            <div className="mirror__city">
              <Factory size={48} className="mirror__building" />
              <div className="mirror__smoke">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="mirror__smoke-particle" style={{
                    '--delay': `${i * 0.4}s`,
                    '--x': `${20 + i * 12}%`,
                    opacity: currentIntensity * 0.6,
                  }} />
                ))}
              </div>
            </div>
            <div className="mirror__metric mirror__metric--danger">
              <span className="mirror__metric-value">
                <AnimatedCounter value={currentDailyCarbon} decimals={1} />
              </span>
              <span className="mirror__metric-unit">{t('mirror.carbon_day', 'kg CO₂/day')}</span>
            </div>
            <div className="mirror__metric-score">
              {t('mirror.score_lbl', 'Score')}: <strong>{score}</strong>/100
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="mirror__divider">
          <div className="mirror__divider-line" />
          <div className="mirror__divider-label">{t('comparison.vs', 'VS')}</div>
          <div className="mirror__divider-line" />
        </div>

        {/* Right: Sustainable */}
        <motion.div
          className="mirror__panel mirror__panel--sustainable"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mirror__panel-label">{t('mirror.sustainable_you', 'Sustainable You')}</div>
          <div className="mirror__visual mirror__visual--green" style={{ '--pollution': mirrorIntensity }}>
            <div className="mirror__nature">
              <TreePine size={40} className="mirror__tree mirror__tree--1" />
              <TreePine size={48} className="mirror__tree mirror__tree--2" />
              <TreePine size={36} className="mirror__tree mirror__tree--3" />
              <Wind size={24} className="mirror__wind" />
              <Droplets size={20} className="mirror__drops" />
            </div>
            <div className="mirror__metric mirror__metric--success">
              <span className="mirror__metric-value">
                <AnimatedCounter value={mirrorCarbon} decimals={1} />
              </span>
              <span className="mirror__metric-unit">{t('mirror.carbon_day', 'kg CO₂/day')}</span>
            </div>
            <div className="mirror__metric-score mirror__metric-score--good">
              {t('mirror.score_lbl', 'Score')}: <strong>{mirrorScore}</strong>/100
            </div>
          </div>
        </motion.div>
      </div>

      {/* Impact summary */}
      {totalSavings > 0 && (
        <motion.div
          className="mirror__impact"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="mirror__impact-card" glow>
            <div className="mirror__impact-grid">
              <div className="mirror__impact-stat">
                <span className="mirror__impact-number text-gradient">
                  <AnimatedCounter value={totalSavings} decimals={1} />
                </span>
                <span className="mirror__impact-label">{t('mirror.saved_day', 'kg CO₂ saved/day')}</span>
              </div>
              <div className="mirror__impact-stat">
                <span className="mirror__impact-number text-gradient">
                  <AnimatedCounter value={yearlyReduction} decimals={0} />
                </span>
                <span className="mirror__impact-label">{t('mirror.saved_year', 'kg CO₂ saved/year')}</span>
              </div>
              <div className="mirror__impact-stat">
                <span className="mirror__impact-number text-gradient">
                  <AnimatedCounter value={treesEquivalent} decimals={0} />
                </span>
                <span className="mirror__impact-label">{t('mirror.trees_equiv', 'trees equivalent 🌳')}</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Scenario toggles */}
      <div className="mirror__scenarios">
        <h2>{t('mirror.what_if', 'What if you…')}</h2>
        <div className="mirror__scenario-grid">
          {SCENARIOS.map((scenario, i) => {
            const isActive = activeScenarios.includes(scenario.key);
            return (
              <motion.button
                key={scenario.key}
                className={`mirror__scenario ${isActive ? 'mirror__scenario--active' : ''}`}
                onClick={() => toggleScenario(scenario.key)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                whileTap={{ scale: 0.97 }}
                id={`scenario-${scenario.key}`}
              >
                <span className="mirror__scenario-emoji">{scenario.icon}</span>
                <span className="mirror__scenario-label">{t(`mirror.scenario.${scenario.key}`, scenario.label)}</span>
                <span className="mirror__scenario-savings">
                  -{scenario.savingsKg} {t('mirror.kg_day', 'kg/day')}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
