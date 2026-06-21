import { useEffect, useRef, useState } from 'react';

export default function AnimatedCounter({ value, duration = 500, decimals = 1, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const frameRef = useRef(null);

  useEffect(() => {
    const startVal = prevValue.current;
    const endVal = value;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * eased;
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = endVal;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  const formatted = typeof display === 'number'
    ? display.toFixed(decimals)
    : display;

  return (
    <span className="animated-counter">
      {prefix}{formatted}{suffix}
    </span>
  );
}
