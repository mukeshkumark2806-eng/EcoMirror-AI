/**
 * @fileoverview EcoMirror Dashboard — side-by-side current vs. future comparison.
 * Shows real-time score projections as the user toggles lifestyle improvements.
 * @module pages/Dashboard/DashboardPage
 */

import { useState, useMemo, useCallback, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, RotateCcw, Sparkles,
} from 'lucide-react';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  calcScoreFromResponses,
  getImpactLevel,
  calcCarbonReductionPct,
  ENERGY_SLIDERS,
} from '../../utils/carbonCalculations';
import {
  getTransportLabel,
  getFoodLabel,
  getWaterLabel,
  getImpactLevelText,
} from '../../utils/labelHelpers';
import './DashboardPage.css';

/* ================================================================
   IMPROVEMENT DEFINITIONS
   ================================================================ */

const IMPROVEMENTS = {
  transport: {
    car:     { to: 'bus',     scoreGain: 18, label: 'Switch to Bus' },
    bike:    { to: 'bicycle', scoreGain: 12, label: 'Switch to Bicycle' },
    bus:     { to: 'train',   scoreGain: 5,  label: 'Try Train Commute' },
    train:   { to: 'bicycle', scoreGain: 4,  label: 'Try Cycling' },
    walking: null,
    bicycle: null,
  },
  food: {
    heavy_meat: { to: 'mixed',      scoreGain: 12, label: 'Reduce Meat Intake' },
    mixed:      { to: 'vegetarian', scoreGain: 8,  label: 'Go Vegetarian' },
    vegetarian: null,
  },
  water: {
    high:   { to: 'medium', scoreGain: 6, label: 'Reduce Water Use' },
    medium: { to: 'low',    scoreGain: 4, label: 'Save More Water' },
    low:    null,
  },
  energy: {
    default: { scoreGain: 8, label: 'Cut Energy 20%' },
  },
};

/* ================================================================
   ANIMATION VARIANTS
   ================================================================ */

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

/* ================================================================
   SCORE RING — memoised to prevent re-renders on unrelated state
   ================================================================ */

const ScoreRing = memo(function ScoreRing({ score, color, size = 140 }) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const pct = Math.round((score / 100) * 100);

  return (
    <div
      className="eco-dash__score-ring"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Eco score: ${score} out of 100`}
    >
      <svg
        className="eco-dash__score-svg"
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        focusable="false"
      >
        <circle className="eco-dash__score-bg" cx={size / 2} cy={size / 2} r={radius} />
        <motion.circle
          className="eco-dash__score-arc"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      <div className="eco-dash__score-center">
        <span className="eco-dash__score-num" style={{ color }}>
          <AnimatedCounter value={score} decimals={0} duration={500} />
        </span>
        <span className="eco-dash__score-of">/100</span>
      </div>
    </div>
  );
});

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { t } = useLanguage();

  useDocumentTitle('Dashboard');

  /* Load assessment result from localStorage */
  const assessmentResult = useMemo(() => {
    try {
      const data = localStorage.getItem('ecomirror_assessment_result');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }, []);

  /* Active improvement toggles */
  const [activeToggles, setActiveToggles] = useState({
    transport: true,
    food: true,
    water: true,
    energy: true,
  });

  /* ── Derived label helpers (stable with useCallback) ── */
  const tTransport = useCallback((k) => getTransportLabel(k, t), [t]);
  const tFood      = useCallback((k) => getFoodLabel(k, t), [t]);
  const tWater     = useCallback((k) => getWaterLabel(k, t), [t]);
  const tImpact    = useCallback((lvl) => getImpactLevelText(lvl, t), [t]);

  /* ── All useMemo/useCallback MUST come before any conditional return ── */
  const { ecoScore, responses } = assessmentResult ?? { ecoScore: 0, responses: {} };

  const currentImpact = useMemo(() => getImpactLevel(ecoScore), [ecoScore]);

  const futureResponses = useMemo(() => {
    if (!responses) return {};
    const future = { ...responses };

    const tImp = IMPROVEMENTS.transport[responses.transport];
    if (tImp && activeToggles.transport) future.transport = tImp.to;

    const fImp = IMPROVEMENTS.food[responses.food];
    if (fImp && activeToggles.food) future.food = fImp.to;

    const wImp = IMPROVEMENTS.water[responses.water];
    if (wImp && activeToggles.water) future.water = wImp.to;

    if (activeToggles.energy && responses.energy) {
      future.energy = {
        ac_hours:         Math.round(responses.energy.ac_hours * 0.7),
        fan_hours:        Math.round(responses.energy.fan_hours * 0.85),
        appliance_hours:  Math.round(responses.energy.appliance_hours * 0.75),
      };
    }
    return future;
  }, [responses, activeToggles]);

  const futureCalc  = useMemo(() => calcScoreFromResponses(futureResponses), [futureResponses]);
  const currentCalc = useMemo(() => calcScoreFromResponses(responses ?? {}), [responses]);

  const futureScore  = futureCalc.score;
  const futureImpact = useMemo(() => getImpactLevel(futureScore), [futureScore]);
  const scoreDiff    = futureScore - ecoScore;

  const carbonReduction = useMemo(
    () => calcCarbonReductionPct(currentCalc.carbonKg, futureCalc.carbonKg),
    [currentCalc.carbonKg, futureCalc.carbonKg]
  );

  const energySaved = useMemo(() => {
    const cur = responses?.energy
      ? ENERGY_SLIDERS.reduce((s, sl) => s + (responses.energy[sl.id] ?? 0), 0)
      : 0;
    const fut = futureResponses?.energy
      ? ENERGY_SLIDERS.reduce((s, sl) => s + (futureResponses.energy[sl.id] ?? 0), 0)
      : 0;
    return cur > 0 ? Math.round(((cur - fut) / cur) * 100) : 0;
  }, [responses?.energy, futureResponses?.energy]);

  const waterSaved = useMemo(() => {
    const map = { high: { medium: 20, low: 50 }, medium: { low: 30 } };
    return map[responses?.water]?.[futureResponses?.water] ?? 0;
  }, [responses?.water, futureResponses?.water]);

  const treesEquiv = useMemo(() => Math.max(1, Math.round(carbonReduction * 0.3)), [carbonReduction]);
  const drivingKm  = useMemo(() => Math.max(0, Math.round(carbonReduction * 12)), [carbonReduction]);
  const energyKwh  = useMemo(() => Math.max(0, Math.round(energySaved * 2.5)), [energySaved]);
  const waterLitres= useMemo(() => Math.max(0, Math.round(waterSaved * 1.5)), [waterSaved]);

  const toggleItems = useMemo(() => {
    if (!responses) return [];
    const items = [];

    const tImp = IMPROVEMENTS.transport[responses.transport];
    if (tImp) items.push({
      key: 'transport',
      emoji: '🚗',
      label: t('dashboard.improvement.transport.' + responses.transport, tImp.label),
      from: tTransport(responses.transport),
      to: tTransport(tImp.to),
      saving: `+${tImp.scoreGain} ${t('challenges.points.lbl', 'pts')}`,
    });

    const fImp = IMPROVEMENTS.food[responses.food];
    if (fImp) items.push({
      key: 'food',
      emoji: '🥗',
      label: t('dashboard.improvement.food.' + responses.food, fImp.label),
      from: tFood(responses.food),
      to: tFood(fImp.to),
      saving: `+${fImp.scoreGain} ${t('challenges.points.lbl', 'pts')}`,
    });

    const wImp = IMPROVEMENTS.water[responses.water];
    if (wImp) items.push({
      key: 'water',
      emoji: '💧',
      label: t('dashboard.improvement.water.' + responses.water, wImp.label),
      from: tWater(responses.water),
      to: tWater(wImp.to),
      saving: `+${wImp.scoreGain} ${t('challenges.points.lbl', 'pts')}`,
    });

    if (responses.energy) {
      const eImp = IMPROVEMENTS.energy.default;
      items.push({
        key: 'energy',
        emoji: '⚡',
        label: t('dashboard.improvement.energy.default', eImp.label),
        from: `${responses.energy.ac_hours}${t('results.energy.ac_suffix', 'h AC')}`,
        to: `${futureResponses.energy?.ac_hours ?? 0}${t('results.energy.ac_suffix', 'h AC')}`,
        saving: `+${eImp.scoreGain} ${t('challenges.points.lbl', 'pts')}`,
      });
    }

    return items;
  }, [responses, futureResponses?.energy, t, tTransport, tFood, tWater]);

  const handleToggle = useCallback((key) => {
    setActiveToggles(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const formatEnergy = useCallback((e) =>
    e
      ? `${e.ac_hours}${t('results.energy.ac_suffix', 'h AC')} · ${e.fan_hours}${t('results.energy.fan_suffix', 'h Fan')} · ${e.appliance_hours}${t('results.energy.appliance_suffix', 'h Apps')}`
      : '—',
  [t]);

  /* ── Empty state (shown AFTER all hooks) ── */
  if (!assessmentResult) {
    return (
      <div className="eco-dash page-enter">
        <Link to="/" className="back-home-btn" id="back-home-dashboard">
          <ArrowLeft size={16} /> {t('common.back_to_home', 'Back to Home')}
        </Link>
        <div className="eco-dash__empty">
          <motion.div
            className="eco-dash__empty-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            aria-hidden="true"
          >
            🌍
          </motion.div>
          <h2 className="eco-dash__empty-title">
            {t('dashboard.empty.title', 'Take Your Assessment First')}
          </h2>
          <p className="eco-dash__empty-desc">
            {t('dashboard.empty.desc', 'Complete the Carbon Assessment Wizard to unlock your personalised EcoMirror dashboard.')}
          </p>
          <motion.button
            className="eco-dash__empty-btn"
            onClick={() => navigate('/assessment')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            id="dashboard-start-assessment"
          >
            {t('dashboard.empty.btn', 'Start Assessment')} <ArrowRight size={20} />
          </motion.button>
        </div>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <motion.div
      className="eco-dash page-enter"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <Link to="/" className="back-home-btn" id="back-home-dashboard">
        <ArrowLeft size={16} /> {t('common.back_to_home', 'Back to Home')}
      </Link>

      {/* Header */}
      <motion.div className="eco-dash__header" variants={fadeUp}>
        <h1 className="eco-dash__title">{t('dashboard.title_mirror', 'Your EcoMirror')} 🪞</h1>
        <p className="eco-dash__subtitle">
          {t('dashboard.subtitle', 'See who you are today vs. who you could become tomorrow.')}
        </p>
      </motion.div>

      {/* ─── Split comparison ─── */}
      <motion.div className="eco-dash__split" variants={fadeUp}>
        {/* LEFT: Current */}
        <motion.div
          className="eco-dash__panel eco-dash__panel--current"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="eco-dash__panel-header">
            <div className="eco-dash__panel-avatar eco-dash__panel-avatar--current" aria-hidden="true">👤</div>
            <div>
              <div className="eco-dash__panel-label eco-dash__panel-label--current">
                {t('dashboard.current.title', 'Current You')}
              </div>
              <div className="eco-dash__panel-tag">{t('dashboard.current.subtitle', 'Your lifestyle today')}</div>
            </div>
          </div>

          <div className="eco-dash__score-wrap">
            <ScoreRing score={ecoScore} color={currentImpact.color} />
            <div className={`eco-dash__impact-badge eco-dash__impact-badge--${currentImpact.level.toLowerCase()}`}>
              <span className="eco-dash__impact-dot" style={{ background: currentImpact.color }} aria-hidden="true" />
              {tImpact(currentImpact.level)}
            </div>
          </div>

          <div className="eco-dash__habits">
            {[
              { icon: '🚗', cat: t('assessment.step.transport.title', 'Transport'), val: tTransport(responses.transport) },
              { icon: '⚡', cat: t('assessment.step.energy.title', 'Energy'), val: formatEnergy(responses.energy), small: true },
              { icon: '🥗', cat: t('assessment.step.food.title', 'Food'), val: tFood(responses.food) },
              { icon: '💧', cat: t('assessment.step.water.title', 'Water'), val: tWater(responses.water) },
            ].map(({ icon, cat, val, small }) => (
              <div className="eco-dash__habit" key={cat}>
                <span className="eco-dash__habit-icon" aria-hidden="true">{icon}</span>
                <span className="eco-dash__habit-cat">{cat}</span>
                <span className="eco-dash__habit-val" style={small ? { fontSize: 'var(--text-xs)' } : {}}>{val}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* VS divider */}
        <div className="eco-dash__vs" aria-hidden="true">
          <div className="eco-dash__vs-line" />
          <motion.div
            className="eco-dash__vs-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 400, damping: 20 }}
          >
            VS
          </motion.div>
          <div className="eco-dash__vs-line" />
        </div>

        {/* RIGHT: Future */}
        <motion.div
          className="eco-dash__panel eco-dash__panel--future"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="eco-dash__panel-header">
            <div className="eco-dash__panel-avatar eco-dash__panel-avatar--future" aria-hidden="true">🌱</div>
            <div>
              <div className="eco-dash__panel-label eco-dash__panel-label--future">
                {t('dashboard.future.title', 'Future Eco You')}
              </div>
              <div className="eco-dash__panel-tag">{t('dashboard.future.subtitle', 'Your greener potential')}</div>
            </div>
          </div>

          <div className="eco-dash__score-wrap">
            <ScoreRing score={futureScore} color={futureImpact.color} />
            <div className={`eco-dash__impact-badge eco-dash__impact-badge--${futureImpact.level.toLowerCase()}`}>
              <span className="eco-dash__impact-dot" style={{ background: futureImpact.color }} aria-hidden="true" />
              {tImpact(futureImpact.level)}
            </div>
          </div>

          <div className="eco-dash__habits">
            {[
              { icon: '🚗', cat: t('assessment.step.transport.title', 'Transport'), val: tTransport(futureResponses.transport) },
              { icon: '⚡', cat: t('assessment.step.energy.title', 'Energy'), val: formatEnergy(futureResponses.energy), small: true },
              { icon: '🥗', cat: t('assessment.step.food.title', 'Food'), val: tFood(futureResponses.food) },
              { icon: '💧', cat: t('assessment.step.water.title', 'Water'), val: tWater(futureResponses.water) },
            ].map(({ icon, cat, val, small }) => (
              <div className="eco-dash__habit" key={cat}>
                <span className="eco-dash__habit-icon" aria-hidden="true">{icon}</span>
                <span className="eco-dash__habit-cat">{cat}</span>
                <span className="eco-dash__habit-val eco-dash__habit-val--improved" style={small ? { fontSize: 'var(--text-xs)' } : {}}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ─── Comparison stats ─── */}
      <motion.div className="eco-dash__comparison" variants={fadeUp}>
        <h2 className="eco-dash__comparison-title">{t('dashboard.comparison.title', '📊 Visual Comparison')}</h2>
        <div className="eco-dash__comparison-grid">
          {/* Score */}
          <motion.div className="eco-dash__stat-card" whileHover={{ y: -3 }}>
            <div className="eco-dash__stat-icon" aria-hidden="true">🎯</div>
            <div className="eco-dash__stat-label">{t('results.score.title', 'Eco Score')}</div>
            <div className="eco-dash__stat-row">
              <span className="eco-dash__stat-current">{ecoScore}</span>
              <ArrowRight size={16} className="eco-dash__stat-arrow" aria-hidden="true" />
              <span className="eco-dash__stat-future">
                <AnimatedCounter value={futureScore} decimals={0} duration={500} />
              </span>
            </div>
            <span className="eco-dash__stat-delta">+{scoreDiff} {t('challenges.points.lbl', 'points')}</span>
          </motion.div>

          {/* Carbon */}
          <motion.div className="eco-dash__stat-card" whileHover={{ y: -3 }}>
            <div className="eco-dash__stat-icon" aria-hidden="true">🌿</div>
            <div className="eco-dash__stat-label">{t('dashboard.carbon.reduction', 'Carbon Reduction')}</div>
            <div className="eco-dash__stat-row">
              <span className="eco-dash__stat-future">
                -<AnimatedCounter value={carbonReduction} decimals={0} duration={500} />%
              </span>
            </div>
            <div className="eco-dash__progress-row">
              <div
                className="eco-dash__progress-bar"
                role="progressbar"
                aria-valuenow={carbonReduction}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Carbon reduction: ${carbonReduction}%`}
              >
                <motion.div
                  className="eco-dash__progress-fill"
                  style={{ background: '#34d399' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(carbonReduction, 100)}%` }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Water */}
          <motion.div className="eco-dash__stat-card" whileHover={{ y: -3 }}>
            <div className="eco-dash__stat-icon" aria-hidden="true">💧</div>
            <div className="eco-dash__stat-label">{t('dashboard.water.saved.title', 'Water Saved')}</div>
            <div className="eco-dash__stat-row">
              <span className="eco-dash__stat-future">
                -<AnimatedCounter value={waterSaved} decimals={0} duration={500} />%
              </span>
            </div>
            <div className="eco-dash__progress-row">
              <div
                className="eco-dash__progress-bar"
                role="progressbar"
                aria-valuenow={waterSaved}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Water saved: ${waterSaved}%`}
              >
                <motion.div
                  className="eco-dash__progress-fill"
                  style={{ background: '#60a5fa' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(waterSaved, 100)}%` }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Energy */}
          <motion.div className="eco-dash__stat-card" whileHover={{ y: -3 }}>
            <div className="eco-dash__stat-icon" aria-hidden="true">⚡</div>
            <div className="eco-dash__stat-label">{t('dashboard.energy.saved.title', 'Energy Saved')}</div>
            <div className="eco-dash__stat-row">
              <span className="eco-dash__stat-future">
                -<AnimatedCounter value={energySaved} decimals={0} duration={500} />%
              </span>
            </div>
            <div className="eco-dash__progress-row">
              <div
                className="eco-dash__progress-bar"
                role="progressbar"
                aria-valuenow={energySaved}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Energy saved: ${energySaved}%`}
              >
                <motion.div
                  className="eco-dash__progress-fill"
                  style={{ background: '#fbbf24' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(energySaved, 100)}%` }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Interactive toggles ─── */}
      {toggleItems.length > 0 && (
        <motion.div className="eco-dash__toggles" variants={fadeUp}>
          <h2 className="eco-dash__toggles-title">{t('dashboard.toggles.title', '🔄 Apply This Change')}</h2>
          <p className="eco-dash__toggles-desc">
            {t('dashboard.toggles.desc', 'Toggle improvements on or off to see how your Future Score updates in real time.')}
          </p>
          <div className="eco-dash__toggle-grid">
            {toggleItems.map((item, i) => (
              <motion.div
                key={item.key}
                className={`eco-dash__toggle-card ${activeToggles[item.key] ? 'eco-dash__toggle-card--active' : ''}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}
                whileHover={{ scale: 1.01 }}
              >
                <span className="eco-dash__toggle-emoji" aria-hidden="true">{item.emoji}</span>
                <div className="eco-dash__toggle-info">
                  <div className="eco-dash__toggle-label">{item.label}</div>
                  <div className="eco-dash__toggle-change">
                    {item.from} → <span>{item.to}</span>
                  </div>
                </div>
                <span className="eco-dash__toggle-saving">{item.saving}</span>
                <label className="eco-dash__switch">
                  <input
                    type="checkbox"
                    checked={activeToggles[item.key]}
                    onChange={() => handleToggle(item.key)}
                    aria-label={`Toggle ${item.label} improvement`}
                  />
                  <span className="eco-dash__switch-track" aria-hidden="true" />
                  <span className="eco-dash__switch-thumb" aria-hidden="true" />
                </label>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Impact equivalences ─── */}
      <motion.div className="eco-dash__impact-section" variants={fadeUp}>
        <h2 className="eco-dash__impact-title">{t('dashboard.equiv.impact', 'Equivalent Impact Projection')}</h2>
        <div className="eco-dash__impact-grid">
          {[
            { icon: '🌳', value: treesEquiv, label: 'Trees Saved<br />per year',   color: '#34d399', tKey: 'dashboard.equiv.trees' },
            { icon: '🚗', value: drivingKm,  label: 'Fewer km<br />driven per month', color: '#f472b6', tKey: 'dashboard.equiv.driving' },
            { icon: '⚡', value: energyKwh,  label: 'kWh Saved<br />per month',    color: '#fbbf24', tKey: 'dashboard.equiv.energy' },
            { icon: '💧', value: waterLitres,label: 'Litres Saved<br />per day',   color: '#60a5fa', tKey: 'dashboard.equiv.water' },
          ].map(({ icon, value, label, color, tKey }) => (
            <motion.div
              key={tKey}
              className="eco-dash__equiv-card"
              style={{ '--accent': color }}
              whileHover={{ y: -4 }}
            >
              <span className="eco-dash__equiv-icon" aria-hidden="true">{icon}</span>
              <div className="eco-dash__equiv-number" style={{ color }}>
                <AnimatedCounter value={value} decimals={0} duration={500} />
              </div>
              <div
                className="eco-dash__equiv-unit"
                dangerouslySetInnerHTML={{
                  __html: t(tKey, label),
                }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ─── CTA row ─── */}
      <motion.div className="eco-dash__cta-row" variants={fadeUp}>
        <motion.button
          className="eco-dash__cta eco-dash__cta--primary"
          onClick={() => navigate('/assessment')}
          whileHover={{ scale: 1.03, boxShadow: '0 0 35px rgba(0, 212, 170, 0.5)' }}
          whileTap={{ scale: 0.97 }}
          id="dashboard-retake"
        >
          <RotateCcw size={18} aria-hidden="true" />
          {t('results.retake', 'Retake Assessment')}
        </motion.button>
        <motion.button
          className="eco-dash__cta eco-dash__cta--ghost"
          onClick={() => navigate('/mirror')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          id="dashboard-mirror"
        >
          <Sparkles size={18} aria-hidden="true" />
          {t('dashboard.deep_mirror', 'Deep Mirror Analysis')}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
