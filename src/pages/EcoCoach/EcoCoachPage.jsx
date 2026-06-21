import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { SafeText } from '../../utils/sanitize';
import { useAssessmentResult } from '../../hooks/useAssessmentResult';
import './EcoCoachPage.css';

/* ================================================================
   CARBON ENGINE
   ================================================================ */

const TRANSPORT_FACTORS = { car: 1.0, bike: 0.6, bus: 0.3, train: 0.2, walking: 0, bicycle: 0 };
const FOOD_FACTORS = { vegetarian: 0.2, mixed: 0.5, heavy_meat: 1.0 };
const WATER_FACTORS = { low: 0.1, medium: 0.4, high: 0.8 };
const MAX_CARBON = 113;

function getImpactLevel(score) {
  if (score >= 70) return 'Green';
  if (score >= 40) return 'Moderate';
  return 'High';
}

/* ================================================================
   ECO TIPS DATABASE
   ================================================================ */

const ECO_TIPS = [
  'Washing clothes in cold water can reduce energy use by up to 90% per load.',
  'A single tree absorbs about 22 kg of CO₂ per year — plant one today!',
  'LEDs use 75% less energy than incandescent bulbs and last 25× longer.',
  'Line-drying clothes instead of using a dryer saves ~2.4 kg of CO₂ per load.',
  'Eating locally sourced food reduces transport emissions by up to 50%.',
  'Turning off your computer at night saves up to 40 kWh per year.',
  'A reusable water bottle prevents ~156 plastic bottles from landfills yearly.',
  'Composting food waste reduces methane emissions from landfills significantly.',
  'Cycling 10 km instead of driving saves about 2.6 kg of CO₂.',
  'Reducing food waste by 50% could save 1.4 billion tonnes of CO₂ annually.',
  'Carpooling with one other person halves your per-person transport emissions.',
  'Setting your thermostat 1°C lower saves about 10% on heating energy.',
];

/* ================================================================
   QUICK ACTION CATEGORIES
   ================================================================ */

const QUICK_ACTIONS = [
  { key: 'electricity', emoji: '⚡', label: 'Save Electricity' },
  { key: 'transport', emoji: '🚗', label: 'Reduce Travel' },
  { key: 'food', emoji: '🥗', label: 'Sustainable Food' },
  { key: 'water', emoji: '💧', label: 'Water Conservation' },
];

/* ================================================================
   RULE-BASED AI RESPONSE ENGINE
   ================================================================ */

function generateResponse(input, responses, ecoScore, t, getImpactLevelText) {
  const lower = input.toLowerCase();
  const level = getImpactLevel(ecoScore);
  const pointsToGreen = Math.max(0, 70 - ecoScore);

  /* ── Electricity / Energy ──────────────────── */
  if (lower.includes('electric') || lower.includes('energy') || lower.includes('ac') || lower.includes('power') || lower.includes('appliance')) {
    const ac = responses?.energy?.ac_hours || 0;
    const fan = responses?.energy?.fan_hours || 0;
    const apps = responses?.energy?.appliance_hours || 0;
    
    let msg = t('coach.response.energy.header', "Based on your assessment, you use **{ac}h of AC**, **{fan}h of fans**, and **{apps}h of appliances** daily. Here are personalized tips:\n\n")
      .replace('{ac}', ac)
      .replace('{fan}', fan)
      .replace('{apps}', apps);

    const tips = [];
    if (ac > 3) tips.push(t('coach.response.energy.tip.ac_high', "Set your AC to **24°C** instead of lower temps — this alone can save up to 40% cooling energy. Try reducing by {hours} hour(s).").replace('{hours}', Math.max(1, Math.round(ac * 0.25))));
    if (ac > 0) tips.push(t('coach.response.energy.tip.ac_fans', 'Use ceiling fans alongside AC — you can set AC 2°C higher and still feel comfortable.'));
    if (apps > 3) tips.push(t('coach.response.energy.tip.apps_high', "Your **{hours}h of appliance usage** is significant. Unplug devices on standby — they consume 5–10% of household energy.").replace('{hours}', apps));
    tips.push(t('coach.response.energy.tip.led', 'Switch to **LED bulbs** — they use 75% less energy and last 25× longer.'));
    tips.push(t('coach.response.energy.tip.strip', 'Use a **smart power strip** to automatically cut power to idle devices.'));
    if (tips.length === 0) tips.push(t('coach.response.energy.tip.efficient', 'Your energy usage is already efficient! Consider solar panels for the next step.'));
    return msg + tips.map(tVal => `• ${tVal}`).join('\n');
  }

  /* ── Transport ─────────────────────────────── */
  if (lower.includes('transport') || lower.includes('travel') || lower.includes('car') || lower.includes('commut') || lower.includes('driving') || lower.includes('bus') || lower.includes('train')) {
    const mode = responses?.transport || 'car';
    
    const emojiMap = { car: '🚗', bike: '🏍️', bus: '🚌', train: '🚆', walking: '🚶', bicycle: '🚲' };
    const englishMap = { car: 'Car', bike: 'Motorbike', bus: 'Bus', train: 'Train', walking: 'Walking', bicycle: 'Bicycle' };
    const translatedMode = `${emojiMap[mode] || ''} ${t(`assessment.step.transport.opt.${mode}.label`, englishMap[mode] || mode)}`;

    let msg = t('coach.response.transport.header', "You currently use **{mode}** as your primary transport. ").replace('{mode}', translatedMode);

    if (mode === 'car') {
      msg += t('coach.response.transport.car.body', "Cars are the highest-emission mode of daily transport. Here's how to reduce your impact:\n\n• **Use public transit 2-3 days/week** — this alone can cut transport emissions by 40%.\n• For trips under 3 km, try **walking or cycling** — zero emissions + health benefits.\n• **Carpooling** with one colleague halves your per-person emissions.\n• If possible, consider switching to an **electric or hybrid vehicle**.");
    } else if (mode === 'bike') {
      msg += t('coach.response.transport.bike.body', "Motorbikes emit less than cars but still have room for improvement:\n\n• Switch to **public transit** for longer commutes — trains are 80% more efficient.\n• Use a **bicycle** for short trips under 5 km.\n• Keep your motorbike well-maintained — proper tire pressure improves fuel efficiency by 3%.");
    } else if (mode === 'bus') {
      msg += t('coach.response.transport.bus.body', "Great choice using public transit! To improve further:\n\n• Try **cycling or walking** for trips under 3 km.\n• Use **trains** for longer distances — they're even more efficient than buses.\n• Consider getting a **bicycle** for your daily commute.");
    } else {
      msg += t('coach.response.transport.green.body', "Your transport choices are already very eco-friendly! 🌟\n\n• Keep it up — your transport emissions are minimal.\n• Encourage friends and family to try green transport too.\n• For occasional long trips, choose trains over flights when possible.");
    }
    return msg;
  }

  /* ── Food ──────────────────────────────────── */
  if (lower.includes('food') || lower.includes('diet') || lower.includes('meat') || lower.includes('vegetarian') || lower.includes('eat') || lower.includes('meal')) {
    const diet = responses?.food || 'mixed';
    
    const emojiMap = { vegetarian: '🥦', mixed: '🍱', heavy_meat: '🥩' };
    const englishMap = { vegetarian: 'Vegetarian', mixed: 'Mixed', heavy_meat: 'Heavy Meat' };
    const translatedDiet = `${emojiMap[diet] || ''} ${t(`assessment.step.food.opt.${diet}.label`, englishMap[diet] || diet)}`;

    let msg = t('coach.response.food.header', "Your current diet is **{diet}**. ").replace('{diet}', translatedDiet);

    if (diet === 'heavy_meat') {
      msg += t('coach.response.food.heavy_meat.body', "Heavy meat consumption has a high carbon footprint. Here are gradual steps:\n\n• Start with **Meatless Monday** — just one day a week makes a difference.\n• Replace beef with **chicken or fish** — beef has 5× the emissions of chicken.\n• Try **legume-based meals** (lentils, chickpeas) — they're protein-rich and low-carbon.\n• Switching to a mixed diet could **improve your score by ~8 points**.");
    } else if (diet === 'mixed') {
      msg += t('coach.response.food.mixed.body', "A balanced diet is a good start! To go greener:\n\n• Add **3 fully plant-based days** per week.\n• Choose **seasonal, locally-sourced** produce — it has lower transport emissions.\n• Reduce **food waste** — the average household wastes 30% of food purchased.\n• Going fully vegetarian could **boost your score by ~4-6 points**.");
    } else {
      msg += t('coach.response.food.green.body', "Excellent! A vegetarian diet is one of the most impactful eco-choices. 🌱\n\n• Focus on **local and seasonal produce** to minimize transport emissions.\n• Consider reducing **dairy consumption** — dairy has a notable carbon footprint.\n• Try **batch cooking** to reduce energy usage in the kitchen.");
    }
    return msg;
  }

  /* ── Water ─────────────────────────────────── */
  if (lower.includes('water') || lower.includes('shower') || lower.includes('bath')) {
    const usage = responses?.water || 'medium';
    
    const emojiMap = { low: '💧', medium: '🚿', high: '🌊' };
    const englishMap = { low: 'Low', medium: 'Medium', high: 'High' };
    const translatedUsage = `${emojiMap[usage] || ''} ${t(`assessment.step.water.opt.${usage}.label`, englishMap[usage] || usage)}`;

    let msg = t('coach.response.water.header', "Your water usage level is **{usage}**. ").replace('{usage}', translatedUsage);

    if (usage === 'high') {
      msg += t('coach.response.water.high.body', "High water usage contributes to both your carbon footprint and resource depletion:\n\n• Use a **5-minute shower timer** — saves 40+ litres per shower.\n• Fix **leaky taps** — a dripping faucet wastes 20 litres/day.\n• **Reuse greywater** for plants — kitchen and shower water works great.\n• Install **low-flow showerheads** — they reduce water usage by 40%.");
    } else if (usage === 'medium') {
      msg += t('coach.response.water.medium.body', "You're in the moderate range. Here are ways to optimize:\n\n• Take **shorter showers** — aim for under 5 minutes.\n• Run washing machines and dishwashers only with **full loads**.\n• Collect **rainwater** for garden and plant watering.\n• Turn off water while **brushing teeth** — saves 8 litres per minute.");
    } else {
      msg += t('coach.response.water.green.body', "Your water usage is already efficient! Great job! 💧\n\n• Maintain your good habits and share tips with others.\n• Consider installing a **greywater recycling system** for the garden.\n• Monitor your water bill for any unexpected increases (could indicate leaks).");
    }
    return msg;
  }

  /* ── Score / General ───────────────────────── */
  if (lower.includes('score') || lower.includes('carbon') || lower.includes('footprint') || lower.includes('reduce') || lower.includes('improve') || lower.includes('help')) {
    let msg = t('coach.response.score.header', "Your current Eco Score is **{score}/100** ({level}). ")
      .replace('{score}', ecoScore)
      .replace('{level}', getImpactLevelText(level));

    if (pointsToGreen > 0) {
      msg += t('coach.response.score.points_needed', "You're **{points} points** away from Green level! Here's your fastest path:\n\n").replace('{points}', pointsToGreen);
    } else {
      msg += t('coach.response.score.already_green', "You're already in the Green zone! Here's how to stay there and improve:\n\n");
    }

    const tips = [];
    if (['car', 'bike'].includes(responses?.transport)) tips.push(t('coach.response.score.tip.transport', '**Switch to public transport** 2+ days/week → biggest single impact.'));
    if (responses?.food === 'heavy_meat') tips.push(t('coach.response.score.tip.food_heavy', '**Reduce meat consumption** → switch to a mixed diet for ~8 points.'));
    if (responses?.food === 'mixed') tips.push(t('coach.response.score.tip.food_mixed', '**Add 3 vegetarian days** per week → gain ~4-6 points.'));
    if ((responses?.energy?.ac_hours || 0) > 3) tips.push(t('coach.response.score.tip.energy_ac', '**Cut AC by {hours}h/day** → saves significant energy.').replace('{hours}', Math.round((responses?.energy?.ac_hours || 0) * 0.3)));
    if (responses?.water === 'high') tips.push(t('coach.response.score.tip.water', '**Reduce water usage** to medium → gain ~6 points.'));
    if (tips.length === 0) tips.push(t('coach.response.score.tip.maintain', "Keep maintaining your eco-friendly habits — you're doing great!"));
    tips.push(t('coach.response.score.tip.retake', '**Take the assessment again** after making changes to track your progress.'));

    return msg + tips.map(tVal => `• ${tVal}`).join('\n');
  }

  /* ── Greeting ──────────────────────────────── */
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good')) {
    return t('coach.response.greeting', "Hello! 🌱 I'm your **EcoMirror AI Coach**. Your current Eco Score is **{score}/100** ({level}).\n\nI can help you with:\n• ⚡ Saving electricity\n• 🚗 Reducing travel emissions\n• 🥗 Sustainable food choices\n• 💧 Water conservation\n• 📊 Improving your Eco Score\n\nWhat would you like to know?")
      .replace('{score}', ecoScore)
      .replace('{level}', getImpactLevelText(level));
  }

  /* ── Fallback ──────────────────────────────── */
  return t('coach.response.fallback', `Great question! Based on your Eco Score of **{score}/100** ({level}), here are your top opportunities:\n\n• Focus on your **highest-emission category** for the biggest gains.\n• Even small changes in transport, food, or energy make a measurable difference.\n• Try asking me about specific topics like "electricity", "transport", "food", or "water" for personalized advice!\n\nYou're {pointsDesc} — every action counts! 🌍`)
    .replace('{score}', ecoScore)
    .replace('{level}', getImpactLevelText(level))
    .replace('{pointsDesc}', pointsToGreen > 0 
      ? t('coach.welcome.points_needed', "You're **{points} points** from Green level.").replace('{points}', pointsToGreen) 
      : t('coach.welcome.already_green', "already in the **Green zone**")
    );
}

/* ================================================================
   ANIMATIONS
   ================================================================ */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

const msgVariant = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
};

/* ================================================================
   COMPONENT
   ================================================================ */

export default function EcoCoachPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* Load assessment result from hook */
  const [assessmentResult] = useAssessmentResult();

  const ecoScore = assessmentResult?.ecoScore || 50;
  const responses = assessmentResult?.responses || {};
  const level = getImpactLevel(ecoScore);
  const pointsToGreen = Math.max(0, 70 - ecoScore);

  const getImpactLevelText = useCallback((levelName) => {
    if (levelName === 'Green') return t('results.impact.green', 'Green (Low Impact)');
    if (levelName === 'Moderate') return t('results.impact.moderate', 'Moderate (Average)');
    if (levelName === 'High') return t('results.impact.high', 'High (Needs Action)');
    return levelName;
  }, [t]);

  useDocumentTitle('Eco Coach');

  /* Daily tip */
  const dailyTip = useMemo(() => {
    const dayIndex = new Date().getDate() % ECO_TIPS.length;
    return t(`coach.tips.${dayIndex}`, ECO_TIPS[dayIndex]);
  }, [t]);

  /* Motivation message */
  const motivation = useMemo(() => {
    if (pointsToGreen === 0) return t('coach.motivation.green', "🌟 You're in the Green zone! Keep up your amazing eco-friendly lifestyle.");
    if (pointsToGreen <= 10) return t('coach.motivation.near_green', "🚀 You're only {pointsToGreen} points from Green Level — one change could get you there!").replace('{pointsToGreen}', pointsToGreen);
    if (pointsToGreen <= 25) return t('coach.motivation.moderate_green', "🌱 You're {pointsToGreen} points from Green Level. Focus on your top category for the fastest improvement.").replace('{pointsToGreen}', pointsToGreen);
    return t('coach.motivation.far_green', "💪 You're {pointsToGreen} points from Green Level. Let's work together to close that gap step by step.").replace('{pointsToGreen}', pointsToGreen);
  }, [pointsToGreen, t]);

  /* Chat state */
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'bot',
      text: '',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  /* Set welcome message dynamically on language load/change */
  useEffect(() => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === 'welcome') {
        const pointsDesc = pointsToGreen > 0 
          ? t('coach.welcome.points_needed', "You're **{points} points** from Green level.").replace('{points}', pointsToGreen) 
          : t('coach.welcome.already_green', "You're already Green! 🌟");

        return {
          ...msg,
          text: t('coach.welcome.msg', "Welcome! 🌿 I'm your **EcoMirror AI Coach**.\n\nYour Eco Score is **{score}/100** ({level} Impact). {pointsDesc}\n\nAsk me anything about reducing your carbon footprint, or try the quick action buttons below!")
            .replace('{score}', ecoScore)
            .replace('{level}', getImpactLevelText(level))
            .replace('{pointsDesc}', pointsDesc)
        };
      }
      return msg;
    }));
  }, [t, ecoScore, level, pointsToGreen]);

  /* Scroll to bottom on new message */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* Send message */
  const sendMessage = (text) => {
    if (!text.trim()) return;

    const userMsg = { id: `user-${Date.now()}`, type: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const responseText = generateResponse(text, responses, ecoScore, t, getImpactLevelText);
      setIsTyping(false);

      // Append an empty bot message first
      const botMsgId = `bot-${Date.now()}`;
      setMessages(prev => [...prev, { id: botMsgId, type: 'bot', text: '' }]);

      let index = 0;
      const speed = 15; // ms per chunk
      const chunkSize = 4; // characters per tick
      
      const interval = setInterval(() => {
        setMessages(prev => prev.map(msg => {
          if (msg.id === botMsgId) {
            const nextChunk = responseText.slice(0, index + chunkSize);
            return { ...msg, text: nextChunk };
          }
          return msg;
        }));
        
        index += chunkSize;
        if (index >= responseText.length) {
          clearInterval(interval);
        }
      }, speed);

    }, 1000 + Math.random() * 800);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputVal);
  };

  const handleQuickAction = (key) => {
    const queries = {
      electricity: t('coach.query.electricity', 'How can I save electricity?'),
      transport: t('coach.query.transport', 'How can I reduce transport emissions?'),
      food: t('coach.query.food', 'How can I eat more sustainably?'),
      water: t('coach.query.water', 'How can I conserve water?'),
    };
    sendMessage(queries[key]);
  };

  const getQuickActionLabel = (actionKey) => {
    const keyMap = {
      electricity: 'coach.quick.electricity',
      transport: 'coach.quick.transport',
      food: 'coach.quick.food',
      water: 'coach.quick.water',
    };
    const englishMap = {
      electricity: 'Save Electricity',
      transport: 'Reduce Travel',
      food: 'Sustainable Food',
      water: 'Water Conservation',
    };
    return t(keyMap[actionKey], englishMap[actionKey]);
  };

  /* Format message text (markdown-lite) */
  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '<br/>• ');
  };

  /* Empty state */
  if (!assessmentResult) {
    return (
      <div className="eco-coach">
        <div className="coach__empty">
          <motion.div className="coach__empty-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>🤖</motion.div>
          <h2 className="coach__empty-title">{t('coach.empty.title', 'Coach Needs Your Data')}</h2>
          <p className="coach__empty-desc">{t('coach.empty.desc', 'Complete the Carbon Assessment first so I can give you personalized advice.')}</p>
          <motion.button className="ap__cta ap__cta--primary" onClick={() => navigate('/assessment')} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 32px', background: 'linear-gradient(135deg, #00a885, #1af5a0)', color: '#0a0e1a', fontFamily: 'var(--font-heading)', fontWeight: 700, borderRadius: '999px', fontSize: 'var(--text-lg)' }}>
            {t('dashboard.empty.btn', 'Start Assessment')} <ArrowRight size={20} />
          </motion.button>
          <button className="coach__back-btn" onClick={() => navigate('/')} id="coach-return-home" style={{ marginTop: '24px' }}>
            <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
            {t('common.return_to_home', 'Return to Home')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="eco-coach" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* ─── Header ──────────────────────────── */}
      <motion.div className="coach__header" variants={fadeUp} initial="hidden" animate="visible">
        <div className="coach__avatar">🤖</div>
        <h1 className="coach__title">
          {t('coach.heading', 'Eco Coach')}
        </h1>
        <p className="coach__subtitle">
          {t('coach.desc', 'Your AI-powered sustainability advisor. Ask anything about reducing your carbon footprint.')}
        </p>
      </motion.div>

      {/* ─── Motivation Banner ───────────────── */}
      <motion.div
        className="coach__motivation"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="coach__motivation-card">
          <span className="coach__motivation-icon">💡</span>
          <span className="coach__motivation-text">{motivation}</span>
        </div>
      </motion.div>

      {/* ─── Quick Actions ───────────────────── */}
      <motion.div
        className="coach__quick"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="coach__quick-title">{t('coach.quick.title', 'Quick Topics')}</div>
        <div className="coach__quick-grid">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.key}
              className="coach__quick-btn"
              onClick={() => handleQuickAction(action.key)}
            >
              {action.emoji} {getQuickActionLabel(action.key)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── Chat ────────────────────────────── */}
      <div className="coach__chat">
        <div className="coach__messages">
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                className={`coach__msg coach__msg--${msg.type}`}
                variants={msgVariant}
                initial="hidden"
                animate="visible"
                layout
              >
                <div
                  className="coach__msg-avatar coach__msg-avatar--bot"
                  aria-hidden="true"
                >
                  {msg.type === 'bot' ? '🤖' : '👤'}
                </div>
                <SafeText
                  text={msg.text}
                  className="coach__msg-bubble"
                  as="div"
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              className="coach__msg coach__msg--bot"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="coach__msg-avatar coach__msg-avatar--bot">🤖</div>
              <div className="coach__typing">
                <span className="coach__typing-dot" />
                <span className="coach__typing-dot" />
                <span className="coach__typing-dot" />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="coach__input-area">
          <form className="coach__input-wrap" onSubmit={handleSubmit}>
            <label htmlFor="coach-input" className="sr-only">
              {t('coach.input.placeholder', 'Ask about electricity, transport, food, water...')}
            </label>
            <input
              ref={inputRef}
              id="coach-input"
              className="coach__input"
              type="text"
              placeholder={t('coach.input.placeholder', 'Ask about electricity, transport, food, water...')}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              disabled={isTyping}
              aria-label={t('coach.input.placeholder', 'Ask about electricity, transport, food, water...')}
            />
            <button
              type="submit"
              className="coach__send-btn"
              disabled={!inputVal.trim() || isTyping}
              aria-label={t('coach.send', 'Send message')}
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {/* ─── Eco Tip of the Day ──────────────── */}
      <motion.div
        className="coach__tip"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="coach__tip-card">
          <span className="coach__tip-icon">🌱</span>
          <div className="coach__tip-content">
            <div className="coach__tip-label">{t('coach.tip.label', 'Eco Tip of the Day')}</div>
            <div className="coach__tip-text">{dailyTip}</div>
          </div>
        </div>
      </motion.div>

      {/* ─── Back Link ───────────────────────── */}
      <div className="coach__back" style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)' }}>
        <button className="coach__back-btn" onClick={() => navigate('/action-plan')}>
          <ChevronLeft size={16} />
          {t('coach.back.action_plan', 'Back to Action Plan')}
        </button>
        <button className="coach__back-btn" onClick={() => navigate('/')} id="coach-return-home">
          <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
          {t('common.return_to_home', 'Return to Home')}
        </button>
      </div>
    </motion.div>
  );
}
