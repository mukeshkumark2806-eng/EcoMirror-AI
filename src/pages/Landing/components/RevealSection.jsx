/**
 * @fileoverview RevealSection sub-component for scroll-reveal animation on the Landing Page.
 * @module pages/Landing/components/RevealSection
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * Scroll reveal section wrapper.
 * Uses Framer Motion's useInView hook.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Section content.
 * @param {string} [props.className] - Optional custom CSS class.
 * @param {number} [props.delay] - Animation delay in seconds.
 */
export default function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );
}
