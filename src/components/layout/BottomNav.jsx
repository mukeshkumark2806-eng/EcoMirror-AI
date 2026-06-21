import { NavLink, useLocation } from 'react-router-dom';
import { Home, PenLine, Sparkles, BarChart3, Trophy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './BottomNav.css';

export default function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { path: '/dashboard', label: t('nav.home'), icon: Home },
    { path: '/log', label: t('nav.log'), icon: PenLine },
    { path: '/mirror', label: t('nav.mirror'), icon: Sparkles, center: true },
    { path: '/insights', label: t('nav.insights'), icon: BarChart3 },
    { path: '/challenges', label: t('nav.challenges'), icon: Trophy },
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label={t('aria.main_nav', 'Main navigation')}>
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''} ${item.center ? 'bottom-nav__item--center' : ''}`}
            id={`mobile-nav-${item.label.toLowerCase()}`}
          >
            <div className={`bottom-nav__icon ${item.center ? 'bottom-nav__icon--center' : ''}`}>
              <Icon size={item.center ? 24 : 22} />
            </div>
            <span className="bottom-nav__label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
