import { NavLink, Link } from 'react-router-dom';
import { Home, PenLine, Sparkles, BarChart3, Trophy, BookOpen, Award, Settings } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './Sidebar.css';

export default function Sidebar() {
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { path: '/dashboard', label: t('nav.home'), icon: Home },
    { path: '/log', label: t('nav.log'), icon: PenLine },
    { path: '/mirror', label: t('nav.mirror'), icon: Sparkles, highlight: true },
    { path: '/insights', label: t('nav.insights'), icon: BarChart3 },
    { path: '/challenges', label: t('nav.challenges'), icon: Trophy },
    { path: '/learn', label: t('nav.learn'), icon: BookOpen },
    { path: '/achievements', label: t('nav.badges'), icon: Award },
  ];

  return (
    <aside className="sidebar" role="navigation" aria-label={t('aria.main_nav', 'Main navigation')}>
      <Link to="/" className="sidebar__logo" style={{ textDecoration: 'none' }}>
        <div className="sidebar__logo-icon">🌍</div>
        <span className="sidebar__logo-text">{t('brand.name', 'EcoMirror')}</span>
      </Link>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''} ${item.highlight ? 'sidebar__link--highlight' : ''}`}
              id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}
          id="nav-settings"
        >
          <Settings size={20} />
          <span>{t('nav.settings')}</span>
        </NavLink>
      </div>
    </aside>
  );
}
