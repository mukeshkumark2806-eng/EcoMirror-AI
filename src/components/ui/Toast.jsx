import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Award } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import './Toast.css';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  achievement: Award,
};

const COLORS = {
  success: 'var(--color-success)',
  error: 'var(--color-danger)',
  info: 'var(--color-info)',
  achievement: 'var(--color-warning)',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();
  const { t } = useLanguage();

  return (
    <div className="toast-container" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => {
          const Icon = ICONS[toast.type] || Info;
          return (
            <motion.div
              key={toast.id}
              className={`toast toast--${toast.type}`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              layout
            >
              <Icon
                size={20}
                className="toast__icon"
                style={{ color: COLORS[toast.type] }}
              />
              <span className="toast__message">{toast.message}</span>
              <button
                className="toast__close"
                onClick={() => removeToast(toast.id)}
                aria-label={t('aria.dismiss_notification', 'Dismiss notification')}
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
