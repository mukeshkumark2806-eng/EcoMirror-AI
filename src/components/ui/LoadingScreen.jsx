import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './LoadingScreen.css';

export default function LoadingScreen() {
  const { t } = useLanguage();

  return (
    <div className="loading-screen" role="alert" aria-busy="true">
      <div className="loading-screen__glass">
        <div className="loading-screen__icon-container">
          <motion.div
            className="loading-screen__glow"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="loading-screen__icon"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Leaf size={48} className="loading-screen__leaf" />
          </motion.div>
        </div>

        <div className="loading-screen__content">
          <h3 className="loading-screen__title text-gradient">
            {t('loading.title', 'EcoMirror')}
          </h3>
          <p className="loading-screen__subtitle">
            {t('loading.text', 'Reflecting your ecological footprint...')}
          </p>
        </div>

        <div className="loading-screen__progress-bar">
          <motion.div
            className="loading-screen__progress-fill"
            animate={{
              left: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>
    </div>
  );
}
