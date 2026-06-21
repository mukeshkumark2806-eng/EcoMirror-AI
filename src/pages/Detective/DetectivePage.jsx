import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw, Sparkles, Search } from 'lucide-react';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { useLanguage } from '../../context/LanguageContext';
import './DetectivePage.css';

/* ================================================================
   CARBON ENGINE — mirrors Assessment calc exactly
   ================================================================ */

const TRANSPORT_FACTORS = { car: 1.0, bike: 0.6, bus: 0.3, train: 0.2, walking: 0, bicycle: 0 };
const FOOD_FACTORS      = { vegetarian: 0.2, mixed: 0.5, heavy_meat: 1.0 };
const WATER_FACTORS     = { low: 0.1, medium: 0.4, high: 0.8 };
const ENERGY_SLIDERS    = [
  { id: 'ac_hours',        carbonPerUnit: 1.5 },
  { id: 'fan_hours',       carbonPerUnit: 0.1 },
  { id: 'appliance_hours', carbonPerUnit: 0.5 },
];
const MAX_CARBON = 113;

function calcCarbonBreakdown(responses) {
  const transport = (TRANSPORT_FACTORS[responses.transport] || 0) * 30;
  const e = responses.energy || {};
  let energy = 0;
  ENERGY_SLIDERS.forEach(s => { energy += (e[s.id] || 0) * s.carbonPerUnit; });
  const food  = (FOOD_FACTORS[responses.food]   || 0) * 25;
  const water = (WATER_FACTORS[responses.water] || 0) * 15;
  const total = transport + energy + food + water;
  return { transport, energy, food, water, total };
}

function calcScore(responses) {
  const b = calcCarbonBreakdown(responses);
  return Math.max(0, Math.min(100, Math.round(100 - (b.total / MAX_CARBON) * 100)));
}

function getImpactLevel(score) {
  if (score >= 70) return { level: 'Green', color: '#34d399' };
  if (score >= 40) return { level: 'Moderate', color: '#fbbf24' };
  return { level: 'High', color: '#f87171' };
}

/* ================================================================
   STATIC DATA
   ================================================================ */

const CATEGORY_META = {
  transport: { emoji: '🚗', color: '#f472b6' },
  energy:    { emoji: '⚡', color: '#facc15' },
  food:      { emoji: '🥩', color: '#fb923c' },
  water:     { emoji: '💧', color: '#60a5fa' },
};

/* What-If options */
const WHAT_IF = [
  {
    key: 'transport',
    changes: { car: 'bus', bike: 'bicycle', bus: 'train' },
    emoji: '🚌',
  },
  {
    key: 'food',
    changes: { heavy_meat: 'mixed', mixed: 'vegetarian' },
    emoji: '🥗',
  },
  {
    key: 'water',
    changes: { high: 'medium', medium: 'low' },
    emoji: '💧',
  },
  {
    key: 'energy',
    isEnergy: true,
    emoji: '⚡',
  },
];

/* Offender reasons by category */
const OFFENDER_REASONS = {
  transport: 'Daily motor vehicle travel contributes most to your carbon emissions. Switching to public transit or cycling could make a huge difference.',
  energy: 'Your electricity consumption, particularly air conditioning, is your biggest emission source. Small reductions add up fast.',
  food: 'Your dietary choices contribute the most to your carbon footprint. Reducing meat intake even slightly has a measurable impact.',
  water: 'Your water usage is the dominant contributor. Shorter showers and efficient appliances can cut this significantly.',
};

/* ================================================================
   ANIMATION VARIANTS
   ================================================================ */

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
};

/* ================================================================
   PIE CHART SUB-COMPONENT
   ================================================================ */

function DonutChart({ segments }) {
  const r = 80;
  const { t } = useLanguage();
  const circumference = 2 * Math.PI * r;
  let cumulativeOffset = 0;

  return (
    <div className="detective__pie-wrap">
      <svg className="detective__pie-svg" viewBox="0 0 240 240">
        {segments.map((seg, i) => {
          const dashLen = (seg.pct / 100) * circumference;
          const dashGap = circumference - dashLen;
          const offset = -cumulativeOffset;
          cumulativeOffset += dashLen;

          return (
            <motion.circle
              key={seg.key}
              className="detective__pie-segment"
              cx="120" cy="120" r={r}
              stroke={seg.color}
              strokeDasharray={`${dashLen} ${dashGap}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: [0.4, 0, 0.2, 1] }}
            />
          );
        })}
      </svg>
      <div className="detective__pie-center">
        <span className="detective__pie-total">100%</span>
        <span className="detective__pie-label">{t('detective.chart.total', 'Total')}</span>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export default function DetectivePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  /* Load assessment from localStorage */
  const assessmentResult = useMemo(() => {
    try {
      const data = localStorage.getItem('ecomirror_assessment_result');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }, []);

  /* Simulator toggles */
  const [simToggles, setSimToggles] = useState({
    transport: false,
    food: false,
    water: false,
    energy: false,
  });

  // Category Translation Helper
  const getCategoryLabel = (key) => {
    const defaultLabels = { transport: 'Transportation', energy: 'Electricity', food: 'Food', water: 'Water' };
    const translationKeys = {
      transport: 'assessment.step.transport.title',
      energy: 'assessment.step.energy.title',
      food: 'assessment.step.food.title',
      water: 'assessment.step.water.title'
    };
    return t(translationKeys[key], defaultLabels[key]);
  };

  // Option Translator Helper
  const getOptionLabel = (category, optionId) => {
    const emojiMap = {
      car: '🚗', bike: '🏍️', bus: '🚌', train: '🚆', walking: '🚶', bicycle: '🚲',
      vegetarian: '🥦', mixed: '🍱', heavy_meat: '🥩',
      low: '💧', medium: '🚿', high: '🌊'
    };
    const englishMap = {
      car: 'Car', bike: 'Motorbike', bus: 'Bus', train: 'Train', walking: 'Walking', bicycle: 'Bicycle',
      vegetarian: 'Vegetarian', mixed: 'Mixed', heavy_meat: 'Heavy Meat',
      low: 'Low', medium: 'Medium', high: 'High'
    };
    const label = t(`assessment.step.${category}.opt.${optionId}.label`, englishMap[optionId] || optionId);
    return `${emojiMap[optionId] || ''} ${label}`;
  };

  const getWhatIfLabel = (item) => {
    if (item.isEnergy) {
      return t('detective.simulator.reduce_energy', 'Cut AC & Appliances by 30%');
    }
    const fromVal = responses[item.key];
    const toVal = item.changes[fromVal];
    if (!toVal) return '';

    const fromLabel = getOptionLabel(item.key, fromVal);
    const toLabel = getOptionLabel(item.key, toVal);
    return `${fromLabel} → ${toLabel}`;
  };

  /* ── Empty state ───────────────────────────── */
  if (!assessmentResult) {
    return (
      <div className="detective">
        <div className="detective__scanlines" aria-hidden />
        <div className="detective__empty">
          <motion.div className="detective__empty-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            🔍
          </motion.div>
          <h2 className="detective__empty-title">{t('detective.empty.title', 'No Case File Found')}</h2>
          <p className="detective__empty-desc">
            {t('detective.empty.desc', "Complete the Carbon Assessment first — then we'll investigate your lifestyle emissions.")}
          </p>
          <motion.button
            className="detective__cta"
            onClick={() => navigate('/assessment')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {t('dashboard.empty.btn', 'Start Assessment')} <ArrowRight size={20} />
          </motion.button>
        </div>
      </div>
    );
  }

  /* ── Compute all data ──────────────────────── */
  const { responses, ecoScore } = assessmentResult;
  const breakdown = calcCarbonBreakdown(responses);

  /* Percentages */
  const categories = ['transport', 'energy', 'food', 'water'];
  const rawPcts = categories.map(k => ({
    key: k,
    carbon: breakdown[k],
    ...CATEGORY_META[k],
  }));
  const totalC = breakdown.total || 1;
  rawPcts.forEach(c => { c.pct = Math.round((c.carbon / totalC) * 100); });
  // Fix rounding so they sum to 100
  const pctSum = rawPcts.reduce((s, c) => s + c.pct, 0);
  if (pctSum !== 100 && rawPcts.length > 0) {
    rawPcts[0].pct += (100 - pctSum);
  }
  // Sort descending
  const ranked = [...rawPcts].sort((a, b) => b.pct - a.pct);

  /* Top offender */
  const topOffender = ranked[0];

  /* ── Detective insights (personalized) ─────── */
  const insights = [];
  // AC insight
  if (responses.energy?.ac_hours > 6) {
    insights.push({ icon: '❄️', text: t('detective.insight.ac_hours', "You run <strong>AC for {hours} hours/day</strong> — that's higher than average. Reducing by even 2 hours saves significant energy.").replace('{hours}', responses.energy.ac_hours) });
  }
  // Transport insight
  if (ranked[0].key === 'transport') {
    insights.push({ icon: '🚗', text: t('detective.insight.transport', "<strong>Transportation contributes {pct}%</strong> of your footprint — more than any other category.").replace('{pct}', ranked[0].pct) });
  }
  // Food insight
  if (responses.food === 'heavy_meat') {
    insights.push({ icon: '🥩', text: t('detective.insight.heavy_meat', "Switching from <strong>heavy meat to mixed diet</strong> would improve your Eco Score by ~8 points.") });
  } else if (responses.food === 'mixed') {
    insights.push({ icon: '🍱', text: t('detective.insight.mixed_diet', "Going <strong>vegetarian 3 days/week</strong> could cut your food emissions by 40%.") });
  }
  // Water insight
  if (responses.water === 'high') {
    insights.push({ icon: '🌊', text: t('detective.insight.high_water', "Your water usage is <strong>High</strong>. A 5-minute shower timer could save 40+ litres daily.") });
  }
  // Energy total
  const totalEnergy = (responses.energy?.ac_hours || 0) + (responses.energy?.fan_hours || 0) + (responses.energy?.appliance_hours || 0);
  if (totalEnergy > 20) {
    insights.push({ icon: '⚡', text: t('detective.insight.total_energy', "You consume <strong>{hours} hours</strong> of combined appliance usage daily — consider energy-efficient appliances.").replace('{hours}', totalEnergy) });
  }
  // Score insight
  if (ecoScore < 50) {
    insights.push({ icon: '📉', text: t('detective.insight.low_score', "Your Eco Score of <strong>{score}/100</strong> puts you in the High impact zone. Small changes in your top categories can push you to Moderate.").replace('{score}', ecoScore) });
  } else if (ecoScore < 70) {
    insights.push({ icon: '📊', text: t('detective.insight.moderate_score', "Your Eco Score of <strong>{score}/100</strong> is Moderate. You're close to Green — focus on your top offender to get there.").replace('{score}', ecoScore) });
  }
  // Fallback if too few
  if (insights.length < 3) {
    insights.push({ icon: '🔎', text: t('detective.insight.fallback', "Your <strong>biggest carbon source</strong> is {label} at {pct}%. Tackling this first will give you the largest improvement.").replace('{label}', getCategoryLabel(topOffender.key).toLowerCase()).replace('{pct}', topOffender.pct) });
  }

  /* ── What-If Simulator ─────────────────────── */
  const simulatedResponses = useMemo(() => {
    const sim = { ...responses, energy: { ...responses.energy } };
    WHAT_IF.forEach(w => {
      if (!simToggles[w.key]) return;
      if (w.isEnergy) {
        sim.energy = {
          ac_hours: Math.round((responses.energy?.ac_hours || 0) * 0.7),
          fan_hours: Math.round((responses.energy?.fan_hours || 0) * 0.85),
          appliance_hours: Math.round((responses.energy?.appliance_hours || 0) * 0.7),
        };
      } else if (w.changes[responses[w.key]]) {
        sim[w.key] = w.changes[responses[w.key]];
      }
    });
    return sim;
  }, [responses, simToggles]);

  const simScore = calcScore(simulatedResponses);
  const simBreakdown = calcCarbonBreakdown(simulatedResponses);
  const carbonReduction = totalC > 0 ? Math.round(((totalC - simBreakdown.total) / totalC) * 100) : 0;
  const simImpact = getImpactLevel(simScore);

  /* Build toggle items */
  const simItems = WHAT_IF.map(w => {
    if (w.isEnergy) {
      return { ...w, available: true, changeLabel: t('detective.simulator.reduce_energy', 'Cut AC & Appliances by 30%') };
    }
    const fromVal = responses[w.key];
    if (w.changes[fromVal]) {
      return { ...w, available: true, changeLabel: getWhatIfLabel(w) };
    }
    return { ...w, available: false };
  }).filter(w => w.available);

  const handleToggle = (key) => {
    setSimToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getImpactLevelText = (level) => {
    if (level === 'Green') return t('results.impact.green', 'Green (Low Impact)');
    if (level === 'Moderate') return t('results.impact.moderate', 'Moderate (Average)');
    if (level === 'High') return t('results.impact.high', 'High (Needs Action)');
    return level;
  };

  /* ── Render ────────────────────────────────── */
  return (
    <motion.div
      className="detective"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <div className="detective__scanlines" aria-hidden />

      {/* ─── Header ──────────────────────────── */}
      <motion.div className="detective__header" variants={fadeUp}>
        <div className="detective__badge">
          <span className="detective__badge-dot" />
          {t('detective.case.active', 'Case File Active')}
        </div>
        <h1 className="detective__title">
          {t('detective.report_title', 'Carbon Detective Report')} 🔍
        </h1>
        <p className="detective__subtitle">
          {t('detective.desc', "We investigated your lifestyle and found the biggest sources of emissions. Here's the evidence.")}
        </p>
      </motion.div>

      {/* ─── Top Offender Spotlight ──────────── */}
      <motion.div className="detective__offender" variants={fadeUp}>
        <motion.div
          className="detective__offender-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="detective__offender-icon">{topOffender.emoji}</div>
          <div className="detective__offender-info">
            <div className="detective__offender-tag">{t('detective.primary.title', 'Primary Carbon Source')}</div>
            <div className="detective__offender-name">{getCategoryLabel(topOffender.key)}</div>
            <div className="detective__offender-reason">
              {t('detective.offender.' + topOffender.key, OFFENDER_REASONS[topOffender.key])}
            </div>
          </div>
          <div>
            <div className="detective__offender-pct">
              <AnimatedCounter value={topOffender.pct} decimals={0} duration={1200} />%
            </div>
            <span className="detective__offender-pct-label">{t('detective.of_emissions', 'of emissions')}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* ─── Crime Scene Cards ───────────────── */}
      <motion.div className="detective__scene" variants={fadeUp}>
        <h2 className="detective__scene-title">{t('detective.scene.title', '🕵️ Carbon Crime Scene')}</h2>
        <div className="detective__scene-grid">
          {ranked.map((cat, i) => (
            <motion.div
              key={cat.key}
              className={`detective__evidence detective__evidence--${cat.key}`}
              variants={scaleIn}
              whileHover={{ y: -4 }}
            >
              <span className="detective__evidence-rank">#{i + 1}</span>
              <span className="detective__evidence-emoji">{cat.emoji}</span>
              <div className="detective__evidence-name">{getCategoryLabel(cat.key)}</div>
              <div className="detective__evidence-pct" style={{ color: cat.color }}>
                <AnimatedCounter value={cat.pct} decimals={0} duration={1000} />%
              </div>
              <div className="detective__evidence-bar">
                <motion.div
                  className="detective__evidence-fill"
                  style={{ background: cat.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.pct}%` }}
                  transition={{ duration: 1, delay: 0.4 + i * 0.12 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ─── Ranked Breakdown Bars ──────────── */}
      <motion.div className="detective__breakdown" variants={fadeUp}>
        <h2 className="detective__breakdown-title">{t('detective.breakdown.title', '📊 Ranked Breakdown')}</h2>
        <div className="detective__bar-list">
          {ranked.map((cat, i) => (
            <motion.div
              key={cat.key}
              className="detective__bar-item"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            >
              <span className="detective__bar-emoji">{cat.emoji}</span>
              <div className="detective__bar-info">
                <div className="detective__bar-header">
                  <span className="detective__bar-name">{getCategoryLabel(cat.key)}</span>
                  <span className="detective__bar-pct" style={{ color: cat.color }}>
                    <AnimatedCounter value={cat.pct} decimals={0} duration={900} />%
                  </span>
                </div>
                <div className="detective__bar-track">
                  <motion.div
                    className="detective__bar-fill"
                    style={{ background: cat.color, color: cat.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.pct}%` }}
                    transition={{ duration: 1.1, delay: 0.5 + i * 0.12 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ─── Donut Pie Chart ─────────────────── */}
      <motion.div className="detective__chart" variants={fadeUp}>
        <h2 className="detective__chart-title">{t('detective.chart.title', '🍩 Emission Distribution')}</h2>
        <DonutChart segments={ranked} />
        <div className="detective__legend">
          {ranked.map(cat => (
            <div key={cat.key} className="detective__legend-item">
              <span className="detective__legend-dot" style={{ background: cat.color }} />
              {getCategoryLabel(cat.key)} ({cat.pct}%)
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── Detective Insights ──────────────── */}
      <motion.div className="detective__insights" variants={fadeUp}>
        <h2 className="detective__insights-title">{t('detective.insights.title', '🔎 Detective Insights')}</h2>
        <div className="detective__insight-list">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              className="detective__insight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
            >
              <div className="detective__insight-icon">{insight.icon}</div>
              <span
                className="detective__insight-text"
                dangerouslySetInnerHTML={{ __html: insight.text }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ─── What-If Simulator ───────────────── */}
      {simItems.length > 0 && (
        <motion.div className="detective__simulator" variants={fadeUp}>
          <h2 className="detective__simulator-title">{t('detective.simulator.title', '🧪 What-If Simulator')}</h2>
          <p className="detective__simulator-desc">
            {t('detective.simulator.desc', 'Toggle changes below to see how your Eco Score and carbon footprint update in real time.')}
          </p>

          <div className="detective__sim-grid">
            {simItems.map((item, i) => (
              <motion.div
                key={item.key}
                className={`detective__sim-card ${simToggles[item.key] ? 'detective__sim-card--active' : ''}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                whileHover={{ scale: 1.01 }}
              >
                <span className="detective__sim-emoji">{item.emoji}</span>
                <div className="detective__sim-info">
                  <div className="detective__sim-label">{item.changeLabel}</div>
                  <div className="detective__sim-change">
                    {item.isEnergy ? t('detective.simulator.reduce_energy_sub', 'Reduce usage by 30%') : (
                      <>{t('detective.simulator.current_label', 'Current')} → <span>{t('detective.simulator.improved_label', 'Improved')}</span></>
                    )}
                  </div>
                </div>
                <label className="detective__sim-toggle">
                  <input
                    type="checkbox"
                    checked={simToggles[item.key]}
                    onChange={() => handleToggle(item.key)}
                  />
                  <span className="detective__sim-toggle-track" />
                  <span className="detective__sim-toggle-thumb" />
                </label>
              </motion.div>
            ))}
          </div>

          {/* Simulator Live Results */}
          <motion.div
            className="detective__sim-result"
            layout
            transition={{ duration: 0.4 }}
          >
            <div className="detective__sim-stat">
              <span className="detective__sim-stat-icon">🎯</span>
              <span className="detective__sim-stat-value detective__sim-stat-value--green">
                <AnimatedCounter value={simScore} decimals={0} duration={800} />
              </span>
              <span className="detective__sim-stat-label">{t('detective.simulator.new_score', 'New Eco Score')}</span>
            </div>
            <div className="detective__sim-stat">
              <span className="detective__sim-stat-icon">🌿</span>
              <span className="detective__sim-stat-value detective__sim-stat-value--blue">
                -<AnimatedCounter value={carbonReduction} decimals={0} duration={800} />%
              </span>
              <span className="detective__sim-stat-label">{t('dashboard.carbon.reduction', 'Carbon Reduction')}</span>
            </div>
            <div className="detective__sim-stat">
              <span className="detective__sim-stat-icon">✨</span>
              <span className="detective__sim-stat-value detective__sim-stat-value--gold">
                {getImpactLevelText(simImpact.level)}
              </span>
              <span className="detective__sim-stat-label">{t('detective.simulator.future_impact', 'Future Impact')}</span>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ─── CTA ─────────────────────────────── */}
      <motion.div className="detective__cta-section" variants={fadeUp}>
        <motion.button
          className="detective__cta"
          onClick={() => navigate('/action-plan')}
          whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(0, 212, 170, 0.5)' }}
          whileTap={{ scale: 0.97 }}
          id="detective-action-plan"
        >
          <Sparkles size={20} />
          {t('detective.create.plan', 'Create My Action Plan')}
          <ArrowRight size={20} />
        </motion.button>
        <motion.button
          className="detective__cta detective__cta--ghost"
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          id="detective-back-mirror"
        >
          <RotateCcw size={18} />
          {t('detective.back.mirror', 'Back to EcoMirror')}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
