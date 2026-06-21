import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  RotateCcw,
  Leaf,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { SafeText } from '../../utils/sanitize';
import {
  getTransportLabel,
  getFoodLabel,
  getWaterLabel,
  getImpactLevelText,
} from '../../utils/labelHelpers';
import './ResultsPage.css';

/* ── Tips by impact level ───────────────────────────────── */

const TIPS = {
  Green: [
    { icon: '🌟', key: 'results.tips.green.0', text: '<strong>Amazing!</strong> Your lifestyle is already eco-friendly. Keep inspiring others!' },
    { icon: '🌱', key: 'results.tips.green.1', text: '<strong>Plant a tree</strong> to offset even more — every small action compounds.' },
    { icon: '♻️', key: 'results.tips.green.2', text: 'Consider <strong>composting</strong> to further reduce your waste footprint.' },
  ],
  Moderate: [
    { icon: '🚶', key: 'results.tips.moderate.0', text: 'Try <strong>walking or cycling</strong> for short trips — saves fuel and boosts health.' },
    { icon: '💡', key: 'results.tips.moderate.1', text: 'Switch to <strong>LED bulbs</strong> and reduce AC by 1 hour/day to save ~15% energy.' },
    { icon: '🥗', key: 'results.tips.moderate.2', text: 'Adding <strong>2 meatless days</strong> per week can cut food emissions by 30%.' },
  ],
  High: [
    { icon: '🚌', key: 'results.tips.high.0', text: '<strong>Public transport</strong> can reduce your commute emissions by up to 70%.' },
    { icon: '❄️', key: 'results.tips.high.1', text: 'Set AC to <strong>24°C instead of 18°C</strong> — saves up to 40% cooling energy.' },
    { icon: '🥦', key: 'results.tips.high.2', text: 'Gradually shift towards a <strong>plant-rich diet</strong> — start with one meal a day.' },
    { icon: '🚿', key: 'results.tips.high.3', text: 'Take <strong>5-minute showers</strong> — a timer can save 40 litres per shower.' },
  ],
};

/* ── Confetti Colors ────────────────────────────────────── */

const CONFETTI_COLORS = ['#34d399', '#60a5fa', '#fbbf24', '#a78bfa', '#f472b6', '#fb923c'];

/* ── Animation Variants ─────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

/* ── Component ──────────────────────────────────────────── */

export default function ResultsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useDocumentTitle('Results');

  /* Load result from localStorage */
  const result = useMemo(() => {
    try {
      const data = localStorage.getItem('ecomirror_assessment_result');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }, []);

  /* Redirect if no result */
  useEffect(() => {
    if (!result) {
      navigate('/assessment', { replace: true });
    }
  }, [result, navigate]);

  /* Animate score counter */
  useEffect(() => {
    if (!result) return;
    const target = result.ecoScore;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    // Trigger confetti for green scores
    if (target >= 70) {
      setTimeout(() => setShowConfetti(true), 800);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [result]);

  if (!result) return null;

  const { ecoScore, impactLevel, impactColor, responses } = result;

  // SVG circle calculations
  const radius = 96;
  const circumference = 2 * Math.PI * radius;
  const scoreOffset = circumference - (animatedScore / 100) * circumference;

  const impactClass = impactLevel.toLowerCase();

  // Tips translation with fallbacks
  const tips = (TIPS[impactLevel] || TIPS.Moderate).map((tip, idx) => ({
    icon: tip.icon,
    text: t(`results.tips.${impactLevel.toLowerCase()}.${idx}`, tip.text),
  }));

  // Energy summary translation helper
  const energySummary = responses.energy
    ? `${responses.energy.ac_hours}${t('results.energy.ac_suffix', 'h AC')} · ${responses.energy.fan_hours}${t('results.energy.fan_suffix', 'h Fan')} · ${responses.energy.appliance_hours}${t('results.energy.appliance_suffix', 'h Appliances')}`
    : '—';

  return (
    <motion.div
      className="results"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Ambient */}
      <div className="results__ambient" aria-hidden="true">
        <div
          className="results__ambient-orb results__ambient-orb--1"
          style={{ background: impactColor }}
        />
        <div
          className="results__ambient-orb results__ambient-orb--2"
          style={{ background: impactColor }}
        />
      </div>

      {/* Confetti */}
      {showConfetti && (
        <div className="results__confetti" aria-hidden="true">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="results__confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                '--duration': `${2 + Math.random() * 3}s`,
                '--delay': `${Math.random() * 1}s`,
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                transform: `rotate(${Math.random() * 360}deg)`,
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}

      {/* Score Section */}
      <motion.div className="results__score-section" variants={itemVariants}>
        {/* Animated Score Ring */}
        <div
          className="results__score-ring"
          role="img"
          aria-label={`Eco score: ${animatedScore} out of 100`}
        >
          <svg
            className="results__score-svg"
            viewBox="0 0 220 220"
            aria-hidden="true"
            focusable="false"
          >
            <circle className="results__score-bg" cx="110" cy="110" r={radius} />
            <circle
              className="results__score-progress"
              cx="110"
              cy="110"
              r={radius}
              stroke={impactColor}
              strokeDasharray={circumference}
              strokeDashoffset={scoreOffset}
            />
          </svg>
          <div className="results__score-value">
            <span className="results__score-number" style={{ color: impactColor }}>
              {animatedScore}
            </span>
            <span className="results__score-label">{t('results.score.title', 'Eco Score')}</span>
          </div>
        </div>

        {/* Impact Badge */}
        <motion.div
          className={`results__impact-badge results__impact-badge--${impactClass}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5, type: 'spring', stiffness: 400, damping: 20 }}
        >
          <span
            className="results__impact-dot"
            style={{ background: impactColor }}
          />
          {getImpactLevelText(impactLevel)}
        </motion.div>

        <h1 className="results__score-title">
          {impactLevel === 'Green' && (
            <>
              <span aria-hidden="true">🌿 </span>
              <span>You're an </span>
              <span className="text-gradient">Eco Champion!</span>
            </>
          )}
          {impactLevel === 'Moderate' && (
            <>
              <span aria-hidden="true">🌤️ </span>
              <span className="text-gradient">Room to Grow</span>
            </>
          )}
          {impactLevel === 'High' && (
            <>
              <span aria-hidden="true">🔥 </span>
              <span className="text-gradient">Let's Make a Change</span>
            </>
          )}
        </h1>
        <p className="results__score-subtitle">
          {impactLevel === 'Green' &&
            t('results.desc.green', 'Your lifestyle choices are already making a positive impact. Small tweaks can make you even greener!')}
          {impactLevel === 'Moderate' &&
            t('results.desc.moderate', "You're on the right track. A few lifestyle adjustments can significantly reduce your carbon footprint.")}
          {impactLevel === 'High' &&
            t('results.desc.high', 'Every journey starts with a single step. Here are actionable changes to reduce your environmental impact.')}
        </p>
      </motion.div>

      {/* Breakdown Cards */}
      <motion.div className="results__breakdown" variants={itemVariants}>
        {[
          { icon: '🚗', labelKey: 'assessment.step.transport.title', labelFallback: 'Transport', val: getTransportLabel(responses.transport, t), cls: 'transport' },
          { icon: '⚡', labelKey: 'assessment.step.energy.title', labelFallback: 'Energy', val: energySummary, cls: 'energy', small: true },
          { icon: '🥗', labelKey: 'assessment.step.food.title', labelFallback: 'Food', val: getFoodLabel(responses.food, t), cls: 'food' },
          { icon: '💧', labelKey: 'assessment.step.water.title', labelFallback: 'Water', val: getWaterLabel(responses.water, t), cls: 'water' },
        ].map(({ icon, labelKey, labelFallback, val, cls, small }) => (
          <motion.div key={cls} className="results__breakdown-card" whileHover={{ y: -3 }}>
            <div className={`results__breakdown-icon results__breakdown-icon--${cls}`} aria-hidden="true">{icon}</div>
            <div className="results__breakdown-info">
              <div className="results__breakdown-label">{t(labelKey, labelFallback)}</div>
              <div className="results__breakdown-value" style={small ? { fontSize: 'var(--text-sm)' } : {}}>{val}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Personalized Tips */}
      <motion.div className="results__tips" variants={itemVariants}>
        <h2 className="results__tips-title">
          {t('results.tips.title', '💡 Personalized Tips')}
        </h2>
        <div className="results__tips-grid">
          {tips.map((tip, i) => (
            <motion.div
              key={i}
              className="results__tip"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2 + i * 0.15, duration: 0.4 }}
            >
              <span className="results__tip-icon" aria-hidden="true">{tip.icon}</span>
              <SafeText
                text={t(tip.key, tip.text)}
                className="results__tip-text"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div className="results__actions" variants={itemVariants}>
        <motion.button
          className="results__cta results__cta--primary"
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(0, 212, 170, 0.5)' }}
          whileTap={{ scale: 0.97 }}
          id="results-see-ecomirror"
        >
          <Sparkles size={20} />
          {t('results.seeMirror', 'See My EcoMirror')}
          <ArrowRight size={20} />
        </motion.button>

        <motion.button
          className="results__cta results__cta--secondary"
          onClick={() => navigate('/assessment')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          id="results-retake"
        >
          <RotateCcw size={18} />
          {t('results.retake', 'Retake Assessment')}
        </motion.button>

        <motion.button
          className="results__cta results__cta--secondary"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          id="results-return-home"
        >
          <Leaf size={18} />
          {t('common.return_to_home', 'Return to Home')}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
