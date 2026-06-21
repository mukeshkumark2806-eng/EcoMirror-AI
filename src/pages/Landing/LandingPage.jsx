import { useNavigate } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring, animate } from 'framer-motion';
import {
  ArrowRight, Leaf, BarChart3, Target, Sparkles,
  Brain, Search, Trophy, Medal, TrendingUp, Eye,
  Globe, CheckCircle, Zap, Droplets, TreePine, Car,
  Play, ChevronDown, Bot
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { useRef, useEffect, useState, useMemo } from 'react';
import { SafeText } from '../../utils/sanitize';
import './LandingPage.css';

import RevealSection from './components/RevealSection';
import SectionHeading from './components/SectionHeading';
import StatCard from './components/StatCard';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isOnboarded } = useUser();
  const { t } = useLanguage();

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });

  const FEATURES = [
    { icon: Sparkles, title: t('nav.mirror'), desc: t('landing.f1_desc', 'See your ecological reflection in real-time'), path: '/mirror' },
    { icon: BarChart3, title: t('landing.f2_title', 'Smart Insights'), desc: t('landing.f2_desc', 'AI-powered analytics on your carbon footprint'), path: '/insights' },
    { icon: Target, title: t('nav.challenges'), desc: t('landing.f3_desc', 'Gamified goals to reduce your impact'), path: '/challenges' },
    { icon: Leaf, title: t('landing.f4_title', 'Learn & Grow'), desc: t('landing.f4_desc', 'Science-backed tips for sustainable living'), path: '/learn' },
    { icon: Trophy, title: t('landing.f5_title', 'Achievements'), desc: t('landing.f5_desc', 'Track badges, streaks, and eco milestones.'), path: '/achievements' },
    { icon: Bot, title: t('landing.f6_title', 'AI Eco Coach'), desc: t('landing.f6_desc', 'Get personalized sustainability advice instantly.'), path: '/eco-coach' },
  ];

  const PROBLEM_STATS = [
    { value: 36.8, suffix: 'B', label: t('landing.problem.stat1.label'), icon: '🌫️' },
    { value: 1.5, suffix: '°C', label: t('landing.problem.stat2.label'), icon: '🌡️' },
    { value: 80, suffix: '%', label: t('landing.problem.stat3.label'), icon: '❓' },
  ];

  const WORKFLOW_STEPS = [
    { step: '01', icon: Target, title: t('landing.workflow.step1.title'), desc: t('landing.workflow.step1.desc'), color: '#00d4aa' },
    { step: '02', icon: Search, title: t('landing.workflow.step2.title'), desc: t('landing.workflow.step2.desc'), color: '#60a5fa' },
    { step: '03', icon: Brain, title: t('landing.workflow.step3.title'), desc: t('landing.workflow.step3.desc'), color: '#a78bfa' },
    { step: '04', icon: TrendingUp, title: t('landing.workflow.step4.title'), desc: t('landing.workflow.step4.desc'), color: '#34d399' },
  ];

  const KEY_FEATURES = [
    { icon: Brain, title: t('landing.key_feature.coach.title'), desc: t('landing.key_feature.coach.desc'), color: '#60a5fa', emoji: '🤖' },
    { icon: Search, title: t('landing.key_feature.detective.title'), desc: t('landing.key_feature.detective.desc'), color: '#f472b6', emoji: '🕵️' },
    { icon: Target, title: t('landing.key_feature.challenges.title'), desc: t('landing.key_feature.challenges.desc'), color: '#fb923c', emoji: '🎯' },
    { icon: Medal, title: t('landing.key_feature.achievements.title'), desc: t('landing.key_feature.achievements.desc'), color: '#facc15', emoji: '🏆' },
    { icon: BarChart3, title: t('landing.key_feature.insights.title'), desc: t('landing.key_feature.insights.desc'), color: '#34d399', emoji: '📊' },
    { icon: Eye, title: t('landing.key_feature.mirror.title'), desc: t('landing.key_feature.mirror.desc'), color: '#00d4aa', emoji: '🪞' },
  ];

  const LANGUAGES = [
    { code: 'EN', name: 'English', flag: '🇬🇧' },
    { code: 'HI', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'TA', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'TE', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'KN', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ML', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'BN', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'MR', name: 'मराठी', flag: '🇮🇳' },
    { code: 'GU', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'PA', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'ES', name: 'Español', flag: '🇪🇸' },
    { code: 'FR', name: 'Français', flag: '🇫🇷' },
    { code: 'ZH', name: '中文', flag: '🇨🇳' },
    { code: 'AR', name: 'العربية', flag: '🇸🇦' },
    { code: 'PT', name: 'Português', flag: '🇧🇷' },
    { code: 'DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'JA', name: '日本語', flag: '🇯🇵' },
    { code: 'KO', name: '한국어', flag: '🇰🇷' },
    { code: 'RU', name: 'Русский', flag: '🇷🇺' },
    { code: 'IT', name: 'Italiano', flag: '🇮🇹' },
  ];

  const APP_PAGES = [
    { emoji: '🪞', title: t('landing.preview.dashboard.title'), desc: t('landing.preview.dashboard.desc'), color: '#00d4aa', path: '/dashboard' },
    { emoji: '🕵️', title: t('landing.preview.detective.title'), desc: t('landing.preview.detective.desc'), color: '#f472b6', path: '/detective' },
    { emoji: '🤖', title: t('landing.preview.coach.title'), desc: t('landing.preview.coach.desc'), color: '#60a5fa', path: '/eco-coach' },
    { emoji: '🎯', title: t('landing.preview.challenges.title'), desc: t('landing.preview.challenges.desc'), color: '#fb923c', path: '/challenges' },
    { emoji: '📊', title: t('landing.preview.insights.title'), desc: t('landing.preview.insights.desc'), color: '#a78bfa', path: '/insights' },
    { emoji: '🏆', title: t('landing.preview.achievements.title'), desc: t('landing.preview.achievements.desc'), color: '#facc15', path: '/achievements' },
  ];

  const handleStart = () => navigate(isOnboarded ? '/dashboard' : '/onboarding');
  const scrollToNext = () => document.getElementById('problem-section')?.scrollIntoView({ behavior: 'smooth' });

  const handleFeatureClick = (path) => {
    if (path === '/eco-coach') {
      navigate('/eco-coach');
    } else {
      navigate(isOnboarded ? path : '/onboarding');
    }
  };

  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: `${2 + Math.random() * 4}px`,
      duration: `${15 + Math.random() * 20}s`,
      delay: `${Math.random() * 10}s`,
    }));
  }, []);

  return (
    <div className="landing lp-full">

      {/* ══════ EXISTING HERO (unchanged) ══════ */}
      <div className="landing__particles" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="landing__particle"
            style={{
              '--x': p.x,
              '--y': p.y,
              '--size': p.size,
              '--duration': p.duration,
              '--delay': p.delay,
            }}
          />
        ))}
      </div>

      <div className="landing__hero">
        <motion.div
          className="landing__earth"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="landing__earth-globe">🌍</div>
          <div className="landing__earth-ring" />
          <div className="landing__earth-ring landing__earth-ring--2" />
        </motion.div>

        <motion.h1
          className="landing__title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {t('brand.name.eco', 'Eco')}<span className="text-gradient">{t('brand.name.mirror', 'Mirror')}</span> AI
        </motion.h1>

        <motion.p
          className="landing__tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {t('landing.tagline', 'Mirror your lifestyle. See its ecological reflection.')}
        </motion.p>

        <motion.p
          className="landing__subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {t('landing.subtitle')}
        </motion.p>

        <motion.button
          className="landing__cta"
          onClick={handleStart}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0, 212, 170, 0.5)' }}
          whileTap={{ scale: 0.97 }}
          id="landing-cta"
        >
          {isOnboarded ? t('landing.dashboard') : t('landing.discover', 'Discover Your Eco Score')}
          <ArrowRight size={20} />
        </motion.button>
      </div>

      {/* Feature cards */}
      <motion.div
        className="landing__features"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              className="landing__feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 + i * 0.1 }}
              onClick={() => handleFeatureClick(feature.path)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleFeatureClick(feature.path);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`${feature.title} - ${feature.desc}`}
            >
              <div className="landing__feature-icon">
                <Icon size={24} />
              </div>
              <h3 className="landing__feature-title">{feature.title}</h3>
              <p className="landing__feature-desc">{feature.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        className="lp-scroll-indicator"
        onClick={scrollToNext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        whileHover={{ scale: 1.1 }}
        aria-label={t('landing.scroll_aria')}
      >
        <span className="lp-scroll-text">{t('landing.scroll_text')}</span>
        <ChevronDown size={22} className="lp-scroll-chevron" />
      </motion.button>

      {/* ══════ SECTION 1: PROBLEM ══════ */}
      <RevealSection className="lp-section lp-problem" id="problem-section">
        <SectionHeading
          badge={t('landing.section1.badge')}
          title={t('landing.section1.title')}
          highlight={t('landing.section1.highlight')}
          subtitle={t('landing.section1.subtitle')}
        />

        <div className="lp-problem-stats">
          {PROBLEM_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="lp-problem-stat glass"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ y: -4 }}
            >
              <div className="lp-problem-stat-icon">{stat.icon}</div>
              <div className="lp-problem-stat-value">
                {stat.value}{stat.suffix}
              </div>
              <div className="lp-problem-stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="lp-impact-cards">
          {[
            { icon: '🚗', title: t('landing.problem.impact.transport.title'), pct: 29, desc: t('landing.problem.impact.transport.desc'), color: '#f472b6' },
            { icon: '🏭', title: t('landing.problem.impact.energy.title'), pct: 25, desc: t('landing.problem.impact.energy.desc'), color: '#facc15' },
            { icon: '🍔', title: t('landing.problem.impact.food.title'), pct: 21, desc: t('landing.problem.impact.food.desc'), color: '#fb923c' },
            { icon: '🛍️', title: t('landing.problem.impact.consumption.title'), pct: 15, desc: t('landing.problem.impact.consumption.desc'), color: '#a78bfa' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              className="lp-impact-card glass"
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.03, y: -4 }}
            >
              <div className="lp-impact-card-header">
                <span className="lp-impact-icon">{item.icon}</span>
                <span className="lp-impact-title">{item.title}</span>
                <span className="lp-impact-pct" style={{ color: item.color }}>{item.pct}%</span>
              </div>
              <div className="lp-impact-bar">
                <motion.div
                  className="lp-impact-bar-fill"
                  style={{ background: item.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.pct * 3}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                />
              </div>
              <p className="lp-impact-desc">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="lp-problem-callout glass"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="lp-problem-callout-emoji">💡</span>
          <SafeText as="p" text={t('landing.problem.callout')} />
        </motion.div>
      </RevealSection>

      {/* ══════ SECTION 2: HOW IT WORKS ══════ */}
      <RevealSection className="lp-section lp-how-it-works">
        <SectionHeading
          badge={t('landing.section2.badge')}
          title={t('landing.section2.title')}
          highlight={t('landing.section2.highlight')}
          subtitle={t('landing.section2.subtitle')}
        />

        <div className="lp-workflow">
          {WORKFLOW_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                className="lp-workflow-step"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                {/* Connector line */}
                {i < WORKFLOW_STEPS.length - 1 && (
                  <motion.div
                    className="lp-workflow-connector"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.4, duration: 0.6 }}
                  />
                )}

                <motion.div
                  className="lp-workflow-card glass"
                  whileHover={{ y: -8, scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="lp-workflow-step-num" style={{ color: step.color }}>{step.step}</div>
                  <div className="lp-workflow-icon" style={{ '--wf-color': step.color, background: `${step.color}20` }}>
                    <Icon size={28} color={step.color} />
                  </div>
                  <h3 className="lp-workflow-title" style={{ color: step.color }}>{step.title}</h3>
                  <p className="lp-workflow-desc">{step.desc}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </RevealSection>

      {/* ══════ SECTION 3: IMPACT STATISTICS ══════ */}
      <RevealSection className="lp-section lp-impact-stats">
        <SectionHeading
          badge={t('landing.section3.badge')}
          title={t('landing.section3.title')}
          highlight={t('landing.section3.highlight')}
          subtitle={t('landing.section3.subtitle')}
        />

        <div ref={statsRef} className="lp-stats-grid">
          <StatCard icon={TreePine}   value={12400}  suffix="+"  label={t('landing.stats.trees')}    color="#34d399" delay={0}    shouldStart={statsInView} />
          <StatCard icon={Leaf}       value={8900}   suffix=" T" label={t('landing.stats.co2')}        color="#00d4aa" delay={0.1}  shouldStart={statsInView} />
          <StatCard icon={Droplets}   value={2100000} suffix="L" label={t('landing.stats.water')}     color="#60a5fa" delay={0.2}  shouldStart={statsInView} />
          <StatCard icon={Car}        value={540000} suffix=" km" label={t('landing.stats.driving')}  color="#f472b6" delay={0.3}  shouldStart={statsInView} />
          <StatCard icon={Zap}        value={180000} suffix=" kWh" label={t('landing.stats.energy')}         color="#facc15" delay={0.4}  shouldStart={statsInView} />
          <StatCard icon={Trophy}     value={48000}  suffix="+"  label={t('landing.stats.challenges')}   color="#a78bfa" delay={0.5}  shouldStart={statsInView} />
        </div>
      </RevealSection>

      {/* ══════ SECTION 4: MULTILINGUAL SUPPORT ══════ */}
      <RevealSection className="lp-section lp-languages">
        <SectionHeading
          badge={t('landing.section4.badge')}
          title={t('landing.section4.title')}
          highlight={t('landing.section4.highlight')}
          subtitle={t('landing.section4.subtitle')}
        />

        <div className="lp-lang-grid">
          {LANGUAGES.map((lang, i) => (
            <motion.div
              key={lang.code}
              className="lp-lang-card glass"
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4, type: 'spring', stiffness: 200 }}
              whileHover={{ y: -6, scale: 1.08, background: 'rgba(0,212,170,0.12)' }}
            >
              <span className="lp-lang-flag">{lang.flag}</span>
              <span className="lp-lang-code">{lang.code}</span>
              <span className="lp-lang-name">{lang.name}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="lp-lang-badge glass"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Globe size={20} />
          <span>{t('landing.languages.badge_text')}</span>
          <CheckCircle size={18} color="#34d399" />
        </motion.div>
      </RevealSection>

      {/* ══════ SECTION 5: KEY FEATURES ══════ */}
      <RevealSection className="lp-section lp-key-features">
        <SectionHeading
          badge={t('landing.section5.badge')}
          title={t('landing.section5.title')}
          highlight={t('landing.section5.highlight')}
          subtitle={t('landing.section5.subtitle')}
        />

        <div className="lp-features-grid">
          {KEY_FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                className="lp-feature-tile glass"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55 }}
                whileHover={{ y: -8, scale: 1.03 }}
              >
                <div className="lp-feature-tile-emoji">{feat.emoji}</div>
                <div className="lp-feature-tile-icon" style={{ background: `${feat.color}20`, color: feat.color }}>
                  <Icon size={24} />
                </div>
                <h3 className="lp-feature-tile-title">{feat.title}</h3>
                <p className="lp-feature-tile-desc">{feat.desc}</p>
                <div className="lp-feature-tile-glow" style={{ background: `radial-gradient(circle at 50% 100%, ${feat.color}25 0%, transparent 70%)` }} />
              </motion.div>
            );
          })}
        </div>
      </RevealSection>

      {/* ══════ SECTION 6: APP PREVIEW ══════ */}
      <RevealSection className="lp-section lp-app-preview">
        <SectionHeading
          badge={t('landing.section6.badge')}
          title={t('landing.section6.title')}
          highlight={t('landing.section6.highlight')}
          subtitle={t('landing.section6.subtitle')}
        />

        <div className="lp-preview-grid">
          {APP_PAGES.map((page, i) => (
            <motion.div
              key={page.title}
              className="lp-preview-card glass"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55 }}
              whileHover={{ y: -6, scale: 1.02, borderColor: page.color }}
              style={{ '--preview-color': page.color }}
            >
              <div className="lp-preview-screen">
                <div className="lp-preview-screen-header">
                  <div className="lp-preview-dots">
                    <span style={{ background: '#f87171' }} />
                    <span style={{ background: '#fbbf24' }} />
                    <span style={{ background: '#34d399' }} />
                  </div>
                  <div className="lp-preview-screen-title" style={{ color: page.color }}>{page.emoji} {page.title}</div>
                </div>
                <div className="lp-preview-screen-body" style={{ '--preview-color': page.color }}>
                  <div className="lp-preview-bar" style={{ width: '80%', background: page.color }} />
                  <div className="lp-preview-bar" style={{ width: '60%', background: `${page.color}80` }} />
                  <div className="lp-preview-bar" style={{ width: '90%', background: `${page.color}40` }} />
                  <div className="lp-preview-circle" style={{ background: `${page.color}30`, border: `2px solid ${page.color}60` }}>
                    <span style={{ fontSize: '1.8rem' }}>{page.emoji}</span>
                  </div>
                </div>
              </div>
              <div className="lp-preview-info">
                <h4 className="lp-preview-title" style={{ color: page.color }}>{page.title}</h4>
                <p className="lp-preview-desc">{page.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </RevealSection>

      {/* ══════ SECTION 7: FINAL CTA ══════ */}
      <RevealSection className="lp-section lp-final-cta">
        <div className="lp-cta-glow-orb lp-cta-glow-orb--1" />
        <div className="lp-cta-glow-orb lp-cta-glow-orb--2" />
        <div className="lp-cta-glow-orb lp-cta-glow-orb--3" />

        <motion.div
          className="lp-cta-inner"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="lp-cta-earth"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            🌍
          </motion.div>

          <span className="lp-badge lp-badge--cta">{t('landing.cta.badge')}</span>

          <h2 className="lp-cta-title">
            {t('landing.cta.title.p1')}<br />
            <span className="text-gradient">{t('landing.cta.title.p2')}</span>
          </h2>

          <p className="lp-cta-subtitle">
            {t('landing.cta.subtitle')}
          </p>

          <div className="lp-cta-features">
            {[
              t('landing.cta.feat1'),
              t('landing.cta.feat2'),
              t('landing.cta.feat3'),
              t('landing.cta.feat4')
            ].map((item) => (
              <div key={item} className="lp-cta-feature">
                <CheckCircle size={16} color="#34d399" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <motion.button
            className="lp-cta-btn"
            onClick={handleStart}
            whileHover={{ scale: 1.07, boxShadow: '0 0 60px rgba(0, 212, 170, 0.6)' }}
            whileTap={{ scale: 0.96 }}
            id="landing-cta-final"
          >
            <Leaf size={22} />
            {isOnboarded ? t('landing.dashboard') : t('landing.discover')}
            <ArrowRight size={22} />
          </motion.button>

          <p className="lp-cta-note">{t('landing.cta.footer_note')}</p>
        </motion.div>
      </RevealSection>

    </div>
  );
}
