import { useState, useEffect, useCallback } from 'react';
import './Confetti.css';

const COLORS = ['#00d4aa', '#4cc9f0', '#fbbf24', '#f472b6', '#a78bfa', '#34d399', '#fb923c'];

function createParticle(id) {
  return {
    id,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 2,
    size: 4 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    drift: (Math.random() - 0.5) * 40,
  };
}

export default function Confetti({ active = false, duration = 3000 }) {
  const [particles, setParticles] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;
    
    const newParticles = Array.from({ length: 50 }, (_, i) => createParticle(i));
    setParticles(newParticles);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setParticles([]), 500);
    }, duration);

    return () => clearTimeout(timer);
  }, [active, duration]);

  if (!visible && particles.length === 0) return null;

  return (
    <div className={`confetti ${visible ? 'confetti--active' : ''}`} aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti__particle"
          style={{
            left: `${p.x}%`,
            '--delay': `${p.delay}s`,
            '--duration': `${p.duration}s`,
            '--size': `${p.size}px`,
            '--color': p.color,
            '--rotation': `${p.rotation}deg`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
