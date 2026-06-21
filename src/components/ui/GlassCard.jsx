import { motion } from 'framer-motion';
import './GlassCard.css';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  glow = false,
  delay = 0,
  onClick,
  ...props
}) {
  return (
    <motion.div
      className={`glass-card ${hover ? 'glass-card--hover' : ''} ${glow ? 'glass-card--glow' : ''} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.4, 0, 0.2, 1] }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}
