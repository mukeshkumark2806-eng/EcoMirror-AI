/**
 * @fileoverview StatCard sub-component for the Landing Page.
 * @module pages/Landing/components/StatCard
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Animated counter hook.
 *
 * @param {number} target - Target count value.
 * @param {number} [duration] - Animation duration in ms.
 * @param {boolean} [shouldStart] - Trigger animation start flag.
 * @returns {number} Animated display value.
 */
function useAnimatedCounter(target, duration = 2000, shouldStart = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, shouldStart]);
  return count;
}

/**
 * StatCard with icons and animated count values.
 *
 * @param {object} props
 * @param {React.ComponentType} props.icon - Lucide Icon component.
 * @param {number} props.value - Total number to animate up to.
 * @param {string} props.suffix - Suffix text (e.g. "%" or "kg").
 * @param {string} props.label - Explanatory category name.
 * @param {string} props.color - Theme color code for the numeric value.
 * @param {number} props.delay - Animation timeline delay in seconds.
 * @param {boolean} props.shouldStart - Controls when the counter starts.
 */
export default function StatCard({ icon: Icon, value, suffix, label, color, delay, shouldStart }) {
  const count = useAnimatedCounter(value, 2200, shouldStart);
  return (
    <motion.div
      className="lp-stat-card glass"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={shouldStart ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6, scale: 1.03 }}
    >
      <div className="lp-stat-icon" style={{ '--stat-color': color }}>
        <Icon size={26} />
      </div>
      <div className="lp-stat-value" style={{ color }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="lp-stat-label">{label}</div>
    </motion.div>
  );
}
