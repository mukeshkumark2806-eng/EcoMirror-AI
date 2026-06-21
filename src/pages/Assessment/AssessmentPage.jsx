import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useLanguage } from '../../context/LanguageContext';
import './AssessmentPage.css';

/* ── Wizard Step Data ───────────────────────────────────── */

const STEPS = [
  {
    id: 'transport',
    title: 'Transportation',
    desc: 'How do you usually get around?',
    icon: '🚗',
    iconClass: 'transport',
    type: 'select',
    options: [
      { id: 'car', icon: '🚗', label: 'Car', sub: 'Personal vehicle', carbonFactor: 1.0 },
      { id: 'bike', icon: '🏍️', label: 'Motorbike', sub: 'Two-wheeler', carbonFactor: 0.6 },
      { id: 'bus', icon: '🚌', label: 'Bus', sub: 'Public transit', carbonFactor: 0.3 },
      { id: 'train', icon: '🚆', label: 'Train', sub: 'Rail transit', carbonFactor: 0.2 },
      { id: 'walking', icon: '🚶', label: 'Walking', sub: 'Zero emission', carbonFactor: 0 },
      { id: 'bicycle', icon: '🚲', label: 'Bicycle', sub: 'Pedal power', carbonFactor: 0 },
    ],
  },
  {
    id: 'energy',
    title: 'Electricity Usage',
    desc: 'Tell us about your daily energy consumption',
    icon: '⚡',
    iconClass: 'energy',
    type: 'slider',
    sliders: [
      { id: 'ac_hours', label: 'AC Usage', icon: '❄️', min: 0, max: 24, unit: 'hrs/day', desc: 'Air conditioning hours per day', carbonPerUnit: 1.5 },
      { id: 'fan_hours', label: 'Fan Usage', icon: '🌀', min: 0, max: 24, unit: 'hrs/day', desc: 'Fan running hours per day', carbonPerUnit: 0.1 },
      { id: 'appliance_hours', label: 'Appliances', icon: '🔌', min: 0, max: 16, unit: 'hrs/day', desc: 'Average appliance usage hours', carbonPerUnit: 0.5 },
    ],
  },
  {
    id: 'food',
    title: 'Food Habits',
    desc: 'What best describes your diet?',
    icon: '🥗',
    iconClass: 'food',
    type: 'select',
    options: [
      { id: 'vegetarian', icon: '🥦', label: 'Vegetarian', sub: 'Plant-based diet', carbonFactor: 0.2 },
      { id: 'mixed', icon: '🍱', label: 'Mixed', sub: 'Balanced omnivore', carbonFactor: 0.5 },
      { id: 'heavy_meat', icon: '🥩', label: 'Heavy Meat', sub: 'Meat-heavy diet', carbonFactor: 1.0 },
    ],
  },
  {
    id: 'water',
    title: 'Water Usage',
    desc: 'How much water do you typically consume daily?',
    icon: '💧',
    iconClass: 'water',
    type: 'select',
    options: [
      { id: 'low', icon: '💧', label: 'Low', sub: 'Under 80 litres/day', carbonFactor: 0.1 },
      { id: 'medium', icon: '🚿', label: 'Medium', sub: '80–150 litres/day', carbonFactor: 0.4 },
      { id: 'high', icon: '🌊', label: 'High', sub: 'Over 150 litres/day', carbonFactor: 0.8 },
    ],
  },
];

/* ── Animation Variants ─────────────────────────────────── */

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const cardVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
  exit: (direction) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.3 },
  }),
};

const optionVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.05 * i, duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  }),
};

/* ── Component ──────────────────────────────────────────── */

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [responses, setResponses] = useLocalStorage('assessment_responses', {
    transport: null,
    energy: { ac_hours: 2, fan_hours: 6, appliance_hours: 3 },
    food: null,
    water: null,
  });

  const currentStep = STEPS[step];
  const totalSteps = STEPS.length;
  // Progress: 0% on step 0 before anything, 100% when on the last step
  const progress = (step / (totalSteps - 1)) * 100;

  const STEP_LABELS = [
    t('assessment.step.transport.title', 'Transport'),
    t('assessment.step.energy.title', 'Energy'),
    t('assessment.step.food.title', 'Food'),
    t('assessment.step.water.title', 'Water')
  ];

  /* Check if current step has a valid answer */
  const isStepValid = useCallback(() => {
    if (currentStep.type === 'select') {
      return responses[currentStep.id] !== null && responses[currentStep.id] !== undefined;
    }
    if (currentStep.type === 'slider') {
      return true; // Sliders always have default values
    }
    return false;
  }, [currentStep, responses]);

  /* Handle option select */
  const handleSelect = (optionId) => {
    setResponses(prev => ({ ...prev, [currentStep.id]: optionId }));
  };

  /* Handle slider change */
  const handleSliderChange = (sliderId, value) => {
    setResponses(prev => ({
      ...prev,
      energy: { ...prev.energy, [sliderId]: Number(value) },
    }));
  };

  /* Calculate and navigate */
  const goNext = () => {
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      // Calculate results
      let totalCarbon = 0;

      // Transport (weight: 30%)
      const transport = STEPS[0].options.find(o => o.id === responses.transport);
      if (transport) totalCarbon += transport.carbonFactor * 30;

      // Energy (weight: 30%)
      const energy = responses.energy || {};
      STEPS[1].sliders.forEach(slider => {
        const val = energy[slider.id] || 0;
        totalCarbon += val * slider.carbonPerUnit;
      });

      // Food (weight: 25%)
      const food = STEPS[2].options.find(o => o.id === responses.food);
      if (food) totalCarbon += food.carbonFactor * 25;

      // Water (weight: 15%)
      const water = STEPS[3].options.find(o => o.id === responses.water);
      if (water) totalCarbon += water.carbonFactor * 15;

      const maxCarbon = 113;
      const normalized = Math.max(0, Math.min(100, Math.round(100 - (totalCarbon / maxCarbon) * 100)));

      let impactLevel, impactColor;
      if (normalized >= 70) {
        impactLevel = 'Green';
        impactColor = '#34d399';
      } else if (normalized >= 40) {
        impactLevel = 'Moderate';
        impactColor = '#fbbf24';
      } else {
        impactLevel = 'High';
        impactColor = '#f87171';
      }

      const result = {
        ecoScore: normalized,
        impactLevel,
        impactColor,
        totalCarbon: Math.round(totalCarbon * 10) / 10,
        responses,
        completedAt: new Date().toISOString(),
      };

      // ── FIX: Write synchronously BEFORE navigating ──────────────────────────
      // useLocalStorage flushes via useEffect (after paint). If we call
      // navigate() first, ResultsPage mounts and reads localStorage before the
      // write has occurred, finds null, and redirects back — creating the loop.
      // Writing directly here guarantees the value exists when ResultsPage mounts.
      try {
        localStorage.setItem('ecomirror_assessment_result', JSON.stringify(result));
      } catch (e) {
        console.warn('[EcoMirror] Could not persist assessment result:', e.message);
      }

      navigate('/results');
    }
  };

  const goPrev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const goToStep = (idx) => {
    if (idx < step) {
      setDirection(-1);
      setStep(idx);
    }
  };

  return (
    <motion.div
      className="assessment"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* Ambient Background */}
      <div className="assessment__ambient" aria-hidden="true">
        <div className="assessment__ambient-orb assessment__ambient-orb--1" />
        <div className="assessment__ambient-orb assessment__ambient-orb--2" />
        <div className="assessment__ambient-orb assessment__ambient-orb--3" />
      </div>

      {/* Header */}
      <div className="assessment__header">
        <button className="assessment__back-btn" onClick={() => navigate('/')}>
          <ChevronLeft size={16} />
          {t('onboarding.back', 'Back')}
        </button>
        <h1 className="assessment__title">
          {t('assessment.title', 'Carbon Assessment')}
        </h1>
        <p className="assessment__subtitle">
          {t('landing.subtitle')}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="assessment__progress">
        <div className="assessment__progress-bar">
          <motion.div
            className="assessment__progress-fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </div>

        <div className="assessment__steps-indicator">
          {STEPS.map((s, i) => {
            let status = 'upcoming';
            if (i < step) status = 'done';
            if (i === step) status = 'active';

            return (
              <div
                key={s.id}
                className={`assessment__step-dot assessment__step-dot--${status}`}
                onClick={() => goToStep(i)}
                style={{ cursor: i < step ? 'pointer' : 'default' }}
              >
                <motion.div
                  className={`assessment__step-circle assessment__step-circle--${status}`}
                  layout
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  {status === 'done' ? <Check size={16} /> : i + 1}
                </motion.div>
                <span className="assessment__step-label">{STEP_LABELS[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Card (animated) */}
      <div className="assessment__card">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            className="assessment__card-inner"
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {/* Step Header */}
            <div className="assessment__step-header">
              <div className={`assessment__step-icon assessment__step-icon--${currentStep.iconClass}`}>
                <span>{currentStep.icon}</span>
              </div>
              <div>
                <h2 className="assessment__step-title">{t(`assessment.step.${currentStep.id}.title`, currentStep.title)}</h2>
                <p className="assessment__step-desc">{t(`assessment.step.${currentStep.id}.desc`, currentStep.desc)}</p>
              </div>
            </div>

            {/* Step Content */}
            {currentStep.type === 'select' && (
              <div className="assessment__options">
                {currentStep.options.map((option, i) => {
                  const isSelected = responses[currentStep.id] === option.id;
                  return (
                    <motion.div
                      key={option.id}
                      className={`assessment__option ${isSelected ? 'assessment__option--selected' : ''}`}
                      onClick={() => handleSelect(option.id)}
                      custom={i}
                      variants={optionVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {isSelected && (
                        <motion.div
                          className="assessment__option-check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        >
                          <Check size={12} />
                        </motion.div>
                      )}
                      <span className="assessment__option-icon">{option.icon}</span>
                      <span className="assessment__option-label">
                        {t(`assessment.step.${currentStep.id}.opt.${option.id}.label`, option.label)}
                      </span>
                      <span className="assessment__option-sub">
                        {t(`assessment.step.${currentStep.id}.opt.${option.id}.sub`, option.sub)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {currentStep.type === 'slider' && (
              <div className="assessment__sliders">
                {currentStep.sliders.map((slider, i) => (
                  <motion.div
                    key={slider.id}
                    className="assessment__slider-group"
                    custom={i}
                    variants={optionVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="assessment__slider-header">
                      <span className="assessment__slider-label">
                        <span className="assessment__slider-label-icon">{slider.icon}</span>
                        {t(`assessment.step.energy.slider.${slider.id}.label`, slider.label)}
                      </span>
                      <span className="assessment__slider-value">
                        {responses.energy?.[slider.id] ?? slider.min} {slider.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      className="assessment__slider-track"
                      min={slider.min}
                      max={slider.max}
                      value={responses.energy?.[slider.id] ?? slider.min}
                      onChange={(e) => handleSliderChange(slider.id, e.target.value)}
                      style={{
                        background: `linear-gradient(to right, var(--color-primary-500) ${((responses.energy?.[slider.id] ?? slider.min) / slider.max) * 100}%, rgba(255,255,255,0.08) ${((responses.energy?.[slider.id] ?? slider.min) / slider.max) * 100}%)`,
                      }}
                    />
                    <span className="assessment__slider-desc">
                      {t(`assessment.step.energy.slider.${slider.id}.desc`, slider.desc)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="assessment__nav">
              {step > 0 ? (
                <motion.button
                  className="assessment__btn assessment__btn--prev"
                  onClick={goPrev}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ArrowLeft size={18} />
                  {t('onboarding.back')}
                </motion.button>
              ) : (
                <div className="assessment__spacer" />
              )}

              <motion.button
                className="assessment__btn assessment__btn--next"
                onClick={goNext}
                disabled={!isStepValid()}
                whileHover={isStepValid() ? { scale: 1.03, boxShadow: '0 0 30px rgba(0, 212, 170, 0.5)' } : {}}
                whileTap={isStepValid() ? { scale: 0.97 } : {}}
              >
                {step < totalSteps - 1 ? t('onboarding.next', 'Continue') : t('results.seeMirror', 'See My EcoMirror')}
                <ArrowRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Step Counter */}
        <p className="assessment__step-counter">
          {t('assessment.step_counter', 'Step {step} of {total}').replace('{step}', step + 1).replace('{total}', totalSteps)}
        </p>
      </div>
    </motion.div>
  );
}
