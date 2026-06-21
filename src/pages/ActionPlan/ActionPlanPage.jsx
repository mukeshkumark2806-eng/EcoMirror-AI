import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Download, MessageCircle, RotateCcw } from 'lucide-react';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { useLanguage } from '../../context/LanguageContext';
import './ActionPlanPage.css';

/* ================================================================
   CARBON ENGINE
   ================================================================ */

const TRANSPORT_FACTORS = { car: 1.0, bike: 0.6, bus: 0.3, train: 0.2, walking: 0, bicycle: 0 };
const FOOD_FACTORS      = { vegetarian: 0.2, mixed: 0.5, heavy_meat: 1.0 };
const WATER_FACTORS     = { low: 0.1, medium: 0.4, high: 0.8 };
const ENERGY_SLIDERS    = [
  { id: 'ac_hours', carbonPerUnit: 1.5 },
  { id: 'fan_hours', carbonPerUnit: 0.1 },
  { id: 'appliance_hours', carbonPerUnit: 0.5 },
];
const MAX_CARBON = 113;

function calcScore(r) {
  let c = 0;
  c += (TRANSPORT_FACTORS[r.transport] || 0) * 30;
  const e = r.energy || {};
  ENERGY_SLIDERS.forEach(s => { c += (e[s.id] || 0) * s.carbonPerUnit; });
  c += (FOOD_FACTORS[r.food] || 0) * 25;
  c += (WATER_FACTORS[r.water] || 0) * 15;
  return { score: Math.max(0, Math.min(100, Math.round(100 - (c / MAX_CARBON) * 100))), carbon: c };
}

/* ================================================================
   PRIORITY ACTIONS GENERATOR
   ================================================================ */

function generatePriorities(responses) {
  const actions = [];

  // Transport
  if (['car', 'bike'].includes(responses.transport)) {
    actions.push({
      key: 'transport',
      emoji: '🚗',
      action: 'Use public transport at least twice a week',
      desc: 'Replace car/bike commutes with bus or train for 2+ days.',
      impact: 15,
    });
  } else if (responses.transport === 'bus') {
    actions.push({
      key: 'transport',
      emoji: '🚌',
      action: 'Try cycling or walking for short distances',
      desc: 'Trips under 3 km can easily be walked or cycled.',
      impact: 6,
    });
  }

  // Energy
  if ((responses.energy?.ac_hours || 0) > 2) {
    actions.push({
      key: 'energy',
      emoji: '⚡',
      action: `Reduce AC usage by ${Math.max(1, Math.round(responses.energy.ac_hours * 0.3))} hours/day`,
      desc: 'Set AC to 24°C and use fans more — saves significant energy.',
      impact: 8,
    });
  }
  if ((responses.energy?.appliance_hours || 0) > 3) {
    actions.push({
      key: 'energy',
      emoji: '🔌',
      action: 'Turn off standby appliances',
      desc: 'Unplug chargers and devices when not in use.',
      impact: 4,
    });
  }

  // Food
  if (responses.food === 'heavy_meat') {
    actions.push({
      key: 'food',
      emoji: '🥗',
      action: 'Replace 2 meat meals per week with plant-based',
      desc: 'Start with Meatless Monday and one more day — gradually increase.',
      impact: 6,
    });
  } else if (responses.food === 'mixed') {
    actions.push({
      key: 'food',
      emoji: '🥦',
      action: 'Add 3 vegetarian days per week',
      desc: 'Explore legume-based proteins and seasonal vegetables.',
      impact: 4,
    });
  }

  // Water
  if (responses.water === 'high') {
    actions.push({
      key: 'water',
      emoji: '💧',
      action: 'Reduce water wastage by 30%',
      desc: 'Use a shower timer, fix leaks, and reuse water where possible.',
      impact: 4,
    });
  } else if (responses.water === 'medium') {
    actions.push({
      key: 'water',
      emoji: '🚿',
      action: 'Take shorter showers (under 5 minutes)',
      desc: 'A 5-min shower uses ~40L vs 80L for a 10-min one.',
      impact: 2,
    });
  }

  return actions.sort((a, b) => b.impact - a.impact);
}

/* ================================================================
   WEEKLY ROADMAP GENERATOR
   ================================================================ */

function generateRoadmap(responses) {
  const weeks = [
    {
      num: 1,
      label: 'Awareness Week',
      goals: [
        { icon: '📊', text: 'Track all daily activities for baseline measurement' },
        { icon: '🔍', text: 'Identify your top 3 carbon-producing habits' },
        { icon: '🎯', text: 'Set one achievable reduction goal' },
      ],
    },
    {
      num: 2,
      label: 'Quick Wins',
      goals: [],
    },
    {
      num: 3,
      label: 'Lifestyle Shifts',
      goals: [],
    },
    {
      num: 4,
      label: 'Sustain & Optimize',
      goals: [
        { icon: '📈', text: 'Retake assessment and compare scores' },
        { icon: '🏆', text: 'Celebrate improvements and set new goals' },
        { icon: '🌍', text: 'Share your progress with friends and family' },
      ],
    },
  ];

  // Week 2 — Quick wins based on data
  if (['car', 'bike'].includes(responses.transport)) {
    weeks[1].goals.push({ icon: '🚌', text: 'Take bus or train for 2 commutes this week' });
  }
  if ((responses.energy?.ac_hours || 0) > 3) {
    weeks[1].goals.push({ icon: '❄️', text: `Reduce AC by 1 hour/day (to ${responses.energy.ac_hours - 1}h)` });
  }
  weeks[1].goals.push({ icon: '💡', text: 'Switch off 3 unused appliances at night' });
  if (weeks[1].goals.length < 3) {
    weeks[1].goals.push({ icon: '🌿', text: 'Start a simple recycling system at home' });
  }

  // Week 3 — Bigger shifts
  if (responses.food !== 'vegetarian') {
    weeks[2].goals.push({ icon: '🥗', text: 'Cook 3 fully plant-based meals this week' });
  }
  if (responses.water !== 'low') {
    weeks[2].goals.push({ icon: '🚿', text: 'Use a 5-minute shower timer every day' });
  }
  weeks[2].goals.push({ icon: '🚶', text: 'Walk or cycle for all trips under 2 km' });
  if (weeks[2].goals.length < 3) {
    weeks[2].goals.push({ icon: '🔌', text: 'Switch to LED bulbs in 3+ rooms' });
  }

  return weeks;
}

/* ================================================================
   ANIMATIONS
   ================================================================ */

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

/* ================================================================
   PDF DOWNLOAD (frontend-only plain text)
   ================================================================ */

function downloadPlan(priorities, roadmap, currentScore, futureScore, translators) {
  const { t, getPriorityAction, getPriorityDesc, getWeekLabel, getWeekGoalText } = translators;
  const divider = '─'.repeat(50);
  let text = '';
  text += '═══════════════════════════════════════════════════\n';
  text += `       ${t('action.download.header', 'ECOMIRROR AI — PERSONALIZED ACTION PLAN')}\n`;
  text += '═══════════════════════════════════════════════════\n\n';
  text += `${t('action.download.date', 'Date')}: ${new Date().toLocaleDateString()}\n`;
  text += `${t('action.projection.current_score', 'Current Eco Score')}: ${currentScore}/100\n`;
  text += `${t('action.projection.future_score', 'Projected Score')}: ${futureScore}/100\n\n`;
  text += `${divider}\n`;
  text += `  ${t('action.priorities.title', 'PRIORITY ACTIONS')}\n`;
  text += `${divider}\n\n`;
  priorities.forEach((p, i) => {
    text += `${i + 1}. ${p.emoji} ${getPriorityAction(p)}\n`;
    text += `   ${getPriorityDesc(p)}\n`;
    text += `   ${t('action.potential.impact', 'Potential Impact')}: -${p.impact}%\n\n`;
  });
  text += `${divider}\n`;
  text += `  ${t('action.roadmap.title', 'WEEKLY ROADMAP')}\n`;
  text += `${divider}\n\n`;
  roadmap.forEach(w => {
    text += `${t('action.roadmap.week_prefix', 'Week')} ${w.num}: ${getWeekLabel(w)}\n`;
    w.goals.forEach(g => {
      text += `  ${g.icon} ${getWeekGoalText(g)}\n`;
    });
    text += '\n';
  });
  text += `${divider}\n`;
  text += `  ${t('landing.footer', 'Generated by EcoMirror AI')}\n`;
  text += `${divider}\n`;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'EcoMirror_Action_Plan.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ================================================================
   COMPONENT
   ================================================================ */

export default function ActionPlanPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const assessmentResult = useMemo(() => {
    try {
      const data = localStorage.getItem('ecomirror_assessment_result');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }, []);

  /* Priority translation mapping */
  const getPriorityAction = (p) => {
    if (p.action.includes('Reduce AC usage')) {
      const hours = p.action.match(/\d+/)?.[0] || '1';
      return t('action.priority.energy.ac.title', 'Reduce AC usage by {hours} hours/day').replace('{hours}', hours);
    }
    const actionKeys = {
      'Use public transport at least twice a week': 'action.priority.transport.public_transit',
      'Try cycling or walking for short distances': 'action.priority.transport.walk_cycle',
      'Turn off standby appliances': 'action.priority.energy.standby',
      'Replace 2 meat meals per week with plant-based': 'action.priority.food.replace_meat',
      'Add 3 vegetarian days per week': 'action.priority.food.vegetarian_days',
      'Reduce water wastage by 30%': 'action.priority.water.wastage',
      'Take shorter showers (under 5 minutes)': 'action.priority.water.shorter_showers',
    };
    return t(actionKeys[p.action], p.action);
  };

  const getPriorityDesc = (p) => {
    const descKeys = {
      'Replace car/bike commutes with bus or train for 2+ days.': 'action.priority.transport.public_transit_desc',
      'Trips under 3 km can easily be walked or cycled.': 'action.priority.transport.walk_cycle_desc',
      'Set AC to 24°C and use fans more — saves significant energy.': 'action.priority.energy.ac_desc',
      'Unplug chargers and devices when not in use.': 'action.priority.energy.standby_desc',
      'Start with Meatless Monday and one more day — gradually increase.': 'action.priority.food.replace_meat_desc',
      'Explore legume-based proteins and seasonal vegetables.': 'action.priority.food.vegetarian_days_desc',
      'Use a shower timer, fix leaks, and reuse water where possible.': 'action.priority.water.wastage_desc',
      'A 5-min shower uses ~40L vs 80L for a 10-min one.': 'action.priority.water.shorter_showers_desc',
    };
    return t(descKeys[p.desc], p.desc);
  };

  /* Roadmap translation mapping */
  const getWeekLabel = (week) => {
    const labelKeys = {
      'Awareness Week': 'action.roadmap.w1.title',
      'Quick Wins': 'action.roadmap.w2.title',
      'Lifestyle Shifts': 'action.roadmap.w3.title',
      'Sustain & Optimize': 'action.roadmap.w4.title'
    };
    return t(labelKeys[week.label], week.label);
  };

  const getWeekGoalText = (goal) => {
    if (goal.text.includes('Reduce AC by 1 hour/day')) {
      const hours = goal.text.match(/\d+h/)?.[0]?.replace('h', '') || '0';
      return t('action.roadmap.w2.g.ac', 'Reduce AC by 1 hour/day (to {hours}h)').replace('{hours}', hours);
    }
    const goalKeys = {
      'Track all daily activities for baseline measurement': 'action.roadmap.w1.g1',
      'Identify your top 3 carbon-producing habits': 'action.roadmap.w1.g2',
      'Set one achievable reduction goal': 'action.roadmap.w1.g3',
      'Take bus or train for 2 commutes this week': 'action.roadmap.w2.g.transport',
      'Switch off 3 unused appliances at night': 'action.roadmap.w2.g.appliance',
      'Start a simple recycling system at home': 'action.roadmap.w2.g.recycle',
      'Cook 3 fully plant-based meals this week': 'action.roadmap.w3.g.food',
      'Use a 5-minute shower timer every day': 'action.roadmap.w3.g.shower',
      'Walk or cycle for all trips under 2 km': 'action.roadmap.w3.g.walk',
      'Switch to LED bulbs in 3+ rooms': 'action.roadmap.w3.g.led',
      'Retake assessment and compare scores': 'action.roadmap.w4.g1',
      'Celebrate improvements and set new goals': 'action.roadmap.w4.g2',
      'Share your progress with friends and family': 'action.roadmap.w4.g3'
    };
    return t(goalKeys[goal.text], goal.text);
  };

  /* Empty state */
  if (!assessmentResult) {
    return (
      <div className="action-plan">
        <div className="ap__empty">
          <motion.div className="ap__empty-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>📋</motion.div>
          <h2 className="ap__empty-title">{t('action.empty.title', 'No Assessment Data')}</h2>
          <p className="ap__empty-desc">{t('action.empty.desc', 'Complete the Carbon Assessment to generate your personalized action plan.')}</p>
          <motion.button className="ap__cta ap__cta--primary" onClick={() => navigate('/assessment')} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            {t('dashboard.empty.btn', 'Start Assessment')} <ArrowRight size={20} />
          </motion.button>
        </div>
      </div>
    );
  }

  const { ecoScore, responses } = assessmentResult;

  /* Generate data */
  const priorities = useMemo(() => generatePriorities(responses), [responses]);
  const roadmap = useMemo(() => generateRoadmap(responses), [responses]);

  /* Compute future score (all improvements applied) */
  const futureResponses = useMemo(() => {
    const f = { ...responses, energy: { ...(responses.energy || {}) } };
    if (['car', 'bike'].includes(f.transport)) f.transport = 'bus';
    else if (f.transport === 'bus') f.transport = 'train';
    if (f.food === 'heavy_meat') f.food = 'mixed';
    else if (f.food === 'mixed') f.food = 'vegetarian';
    if (f.water === 'high') f.water = 'medium';
    else if (f.water === 'medium') f.water = 'low';
    if (f.energy.ac_hours > 0) f.energy.ac_hours = Math.round(f.energy.ac_hours * 0.7);
    if (f.energy.appliance_hours > 0) f.energy.appliance_hours = Math.round(f.energy.appliance_hours * 0.75);
    return f;
  }, [responses]);

  const currentCalc = calcScore(responses);
  const futureCalc = calcScore(futureResponses);
  const scoreDiff = futureCalc.score - currentCalc.score;
  const carbonReduction = currentCalc.carbon > 0
    ? Math.round(((currentCalc.carbon - futureCalc.carbon) / currentCalc.carbon) * 100)
    : 0;

  /* Impact equivalences */
  const treesEquiv = Math.max(1, Math.round(carbonReduction * 0.4));
  const energyKwh  = Math.max(0, Math.round(carbonReduction * 2.8));
  const waterLitres = Math.max(0, Math.round(carbonReduction * 1.6));
  const drivingKm  = Math.max(0, Math.round(carbonReduction * 14));

  return (
    <motion.div className="action-plan" variants={stagger} initial="hidden" animate="visible">
      {/* ─── Header ────────────────────────────── */}
      <motion.div className="ap__header" variants={fadeUp}>
        <div className="ap__badge">{t('action.badge', '📋 Your Personal Roadmap')}</div>
        <h1 className="ap__title">
          {t('action.heading', 'Action Plan')} 🎯
        </h1>
        <p className="ap__subtitle">
          {t('action.desc', 'A personalized sustainability roadmap generated from your carbon assessment data. Follow these steps to become your greener self.')}
        </p>
      </motion.div>

      {/* ─── Priority Actions ──────────────────── */}
      <motion.div className="ap__priorities" variants={fadeUp}>
        <h2 className="ap__section-title">{t('action.priorities.title', '🔥 Priority Actions')}</h2>
        <div className="ap__priority-list">
          {priorities.map((p, i) => (
            <motion.div
              key={p.key + i}
              className={`ap__priority ap__priority--${p.key}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              whileHover={{ x: 4 }}
            >
              <span className="ap__priority-rank">#{i + 1}</span>
              <span className="ap__priority-icon">{p.emoji}</span>
              <div className="ap__priority-info">
                <div className="ap__priority-action">{getPriorityAction(p)}</div>
                <div className="ap__priority-desc">{getPriorityDesc(p)}</div>
              </div>
              <div className="ap__priority-impact">
                <span className="ap__priority-pct">
                  -<AnimatedCounter value={p.impact} decimals={0} duration={800} />%
                </span>
                <span className="ap__priority-label">{t('action.potential.impact', 'Potential Impact')}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ─── Weekly Roadmap ─────────────────────── */}
      <motion.div className="ap__roadmap" variants={fadeUp}>
        <h2 className="ap__section-title">{t('action.roadmap.title', '📅 4-Week Roadmap')}</h2>
        <div className="ap__week-grid">
          {roadmap.map((week, i) => (
            <motion.div
              key={week.num}
              className="ap__week-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
              whileHover={{ y: -3 }}
            >
              <div className="ap__week-num">{t('action.roadmap.week_prefix', 'Week')} {week.num}</div>
              <div className="ap__week-label">{getWeekLabel(week)}</div>
              <div className="ap__week-goals">
                {week.goals.map((goal, j) => (
                  <div key={j} className="ap__week-goal">
                    <span className="ap__week-goal-icon">{goal.icon}</span>
                    <span>{getWeekGoalText(goal)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ─── Impact Projection ─────────────────── */}
      <motion.div className="ap__projection" variants={fadeUp}>
        <h2 className="ap__section-title">{t('action.projection.title', '📈 Impact Projection')}</h2>

        {/* Score comparison */}
        <div className="ap__projection-score">
          <div className="ap__proj-score-box">
            <div className="ap__proj-score-num" style={{ color: '#f87171' }}>
              <AnimatedCounter value={ecoScore} decimals={0} duration={1000} />
            </div>
            <span className="ap__proj-score-label">{t('action.projection.current_score', 'Current Score')}</span>
          </div>
          <span className="ap__proj-arrow">→</span>
          <div className="ap__proj-score-box">
            <div className="ap__proj-score-num" style={{ color: '#34d399' }}>
              <AnimatedCounter value={futureCalc.score} decimals={0} duration={1200} />
            </div>
            <span className="ap__proj-score-label">{t('action.projection.future_score', 'Future Score')}</span>
          </div>
          <span className="ap__proj-delta">+{scoreDiff} {t('challenges.points.lbl', 'pts')}</span>
        </div>

        {/* Equivalences */}
        <div className="ap__equiv-grid">
          <motion.div className="ap__equiv-card" style={{ '--accent': '#34d399' }} whileHover={{ y: -3 }}>
            <span className="ap__equiv-icon">🌳</span>
            <div className="ap__equiv-num" style={{ color: '#34d399' }}>
              <AnimatedCounter value={treesEquiv} decimals={0} duration={1200} />
            </div>
            <div className="ap__equiv-unit">{t('action.projection.trees', 'Trees Saved / year')}</div>
          </motion.div>

          <motion.div className="ap__equiv-card" style={{ '--accent': '#fbbf24' }} whileHover={{ y: -3 }}>
            <span className="ap__equiv-icon">⚡</span>
            <div className="ap__equiv-num" style={{ color: '#fbbf24' }}>
              <AnimatedCounter value={energyKwh} decimals={0} duration={1200} />
            </div>
            <div className="ap__equiv-unit">{t('action.projection.energy', 'kWh Saved / month')}</div>
          </motion.div>

          <motion.div className="ap__equiv-card" style={{ '--accent': '#60a5fa' }} whileHover={{ y: -3 }}>
            <span className="ap__equiv-icon">💧</span>
            <div className="ap__equiv-num" style={{ color: '#60a5fa' }}>
              <AnimatedCounter value={waterLitres} decimals={0} duration={1200} />
            </div>
            <div className="ap__equiv-unit">{t('action.projection.water', 'Litres Saved / day')}</div>
          </motion.div>

          <motion.div className="ap__equiv-card" style={{ '--accent': '#f472b6' }} whileHover={{ y: -3 }}>
            <span className="ap__equiv-icon">🚗</span>
            <div className="ap__equiv-num" style={{ color: '#f472b6' }}>
              <AnimatedCounter value={drivingKm} decimals={0} duration={1200} />
            </div>
            <div className="ap__equiv-unit">{t('action.projection.driving', 'Fewer km / month')}</div>
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Download ──────────────────────────── */}
      <motion.div className="ap__download-section" variants={fadeUp}>
        <motion.button
          className="ap__download-btn"
          onClick={() => downloadPlan(priorities, roadmap, ecoScore, futureCalc.score, { t, getPriorityAction, getPriorityDesc, getWeekLabel, getWeekGoalText })}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          id="ap-download"
        >
          <Download size={18} />
          {t('action.download.btn', 'Download My Action Plan')}
        </motion.button>
      </motion.div>

      {/* ─── CTA Row ───────────────────────────── */}
      <motion.div className="ap__cta-row" variants={fadeUp}>
        <motion.button
          className="ap__cta ap__cta--primary"
          onClick={() => navigate('/eco-coach')}
          whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(0, 212, 170, 0.5)' }}
          whileTap={{ scale: 0.97 }}
          id="ap-eco-coach"
        >
          <MessageCircle size={18} />
          {t('action.coach.btn', 'Talk to Eco Coach')}
          <ArrowRight size={18} />
        </motion.button>
        <motion.button
          className="ap__cta ap__cta--ghost"
          onClick={() => navigate('/detective')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <RotateCcw size={18} />
          {t('action.back.detective', 'Back to Detective')}
        </motion.button>
        <motion.button
          className="ap__cta ap__cta--ghost"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          id="ap-return-home"
        >
          <ArrowLeft size={18} />
          {t('common.return_to_home', 'Return to Home')}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
