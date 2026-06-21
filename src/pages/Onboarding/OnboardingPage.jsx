import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useEcoScore } from '../../hooks/useEcoScore';
import { useAchievements } from '../../hooks/useAchievements';
import { useLanguage } from '../../context/LanguageContext';
import quizQuestions from '../../data/quizQuestions.json';
import './OnboardingPage.css';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { completeOnboarding } = useUser();
  const { initFromQuiz } = useEcoScore();
  const { unlockBadge } = useAchievements();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);

  const currentQ = quizQuestions[step];
  const totalSteps = quizQuestions.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const selectAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [currentQ.key]: value }));
  };

  const goNext = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      // Complete quiz
      const finalScore = initFromQuiz(answers);
      setScore(finalScore);
      completeOnboarding(answers);
      unlockBadge('badge_first_step');
      setShowScore(true);
    }
  };

  const goBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const canProceed = answers[currentQ?.key] !== undefined;

  if (showScore) {
    return (
      <div className="onboarding">
        <motion.div
          className="onboarding__score-reveal"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.div
            className="onboarding__score-circle"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <span className="onboarding__score-value">{score}</span>
            <span className="onboarding__score-label">{t('onboarding.scoreTitle')}</span>
          </motion.div>

          <motion.h2
            className="onboarding__score-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {score >= 70 ? t('onboarding.greatStart') : score >= 40 ? t('onboarding.roomGrow') : t('onboarding.improveTogether')}
          </motion.h2>

          <motion.p
            className="onboarding__score-desc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            {t('onboarding.scoreDesc')}
          </motion.p>

          <motion.button
            className="onboarding__score-cta"
            onClick={() => navigate('/dashboard')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            id="go-to-dashboard"
          >
            {t('onboarding.goDashboard')}
            <ArrowRight size={20} />
          </motion.button>

          <motion.div
            className="onboarding__badge-unlock"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
          >
            {t('onboarding.firstStepUnlocked')}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="onboarding">
      {/* Progress bar */}
      <div className="onboarding__progress-bar">
        <motion.div
          className="onboarding__progress-fill"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="onboarding__header">
        <span className="onboarding__step-count">
          {t('onboarding.step_counter', 'Step {step} of {total}').replace('{step}', step + 1).replace('{total}', totalSteps)}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="onboarding__question"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="onboarding__question-text">{t(`onboarding.quiz.question.${currentQ.key}`, currentQ.question)}</h2>
          <p className="onboarding__question-desc">{t(`onboarding.quiz.description.${currentQ.key}`, currentQ.description)}</p>

          <div className="onboarding__options">
            {currentQ.options.map(option => (
              <motion.button
                key={option.value}
                className={`onboarding__option ${answers[currentQ.key] === option.value ? 'onboarding__option--selected' : ''}`}
                onClick={() => selectAnswer(option.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id={`quiz-option-${option.value}`}
              >
                <span className="onboarding__option-emoji">{option.emoji}</span>
                <span className="onboarding__option-label">{t(`onboarding.quiz.option.${option.value}`, option.label)}</span>
                {answers[currentQ.key] === option.value && (
                  <motion.div
                    className="onboarding__option-check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Check size={16} />
                  </motion.div>
                )}
                <span className={`onboarding__option-impact onboarding__option-impact--${option.impact}`}>
                  {option.impact}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="onboarding__nav">
        <button
          className="onboarding__nav-btn onboarding__nav-btn--back"
          onClick={goBack}
          disabled={step === 0}
        >
          <ArrowLeft size={18} />
          {t('onboarding.back')}
        </button>
        <button
          className="onboarding__nav-btn onboarding__nav-btn--next"
          onClick={goNext}
          disabled={!canProceed}
          id="quiz-next-btn"
        >
          {step === totalSteps - 1 ? t('onboarding.seeScore') : t('onboarding.next')}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
