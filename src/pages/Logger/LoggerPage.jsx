import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, UtensilsCrossed, Zap, ShoppingBag, Plus, Trash2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useActivities } from '../../hooks/useActivities';
import { useCarbonEngine } from '../../hooks/useCarbonEngine';
import { useAchievements } from '../../hooks/useAchievements';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import './LoggerPage.css';

const CATEGORIES = [
  { key: 'transport', label: 'Transport', icon: Car, color: 'var(--color-transport)' },
  { key: 'food', label: 'Food', icon: UtensilsCrossed, color: 'var(--color-food)' },
  { key: 'energy', label: 'Energy', icon: Zap, color: 'var(--color-energy)' },
  { key: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'var(--color-shopping)' },
];

const VALUE_LABELS = {
  transport: { label: 'Distance', unit: 'km', placeholder: 'e.g. 15' },
  food: { label: 'Servings', unit: 'meals', placeholder: 'e.g. 1' },
  energy: { label: 'Usage', unit: 'kWh / hours', placeholder: 'e.g. 3' },
  shopping: { label: 'Items', unit: 'items / bags', placeholder: 'e.g. 1' },
};

export default function LoggerPage() {
  const [activeCategory, setActiveCategory] = useState('transport');
  const [selectedType, setSelectedType] = useState('');
  const [value, setValue] = useState('');
  const engine = useCarbonEngine();
  const { addActivity, getRecentActivities, removeActivity, activities } = useActivities();
  const { updateStreak, checkAchievements } = useAchievements();
  const toast = useToast();
  const { t } = useLanguage();

  const activityTypes = useMemo(() => {
    return engine.getActivities(activeCategory);
  }, [engine, activeCategory]);

  const recent = useMemo(() => {
    return getRecentActivities(8);
  }, [getRecentActivities, activities]);

  const valInfo = useMemo(() => {
    return VALUE_LABELS[activeCategory];
  }, [activeCategory]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!selectedType || !value) return;

    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal <= 0) return;

    const activity = addActivity({
      category: activeCategory,
      type: selectedType,
      value: numVal,
      unit: valInfo.unit,
    });

    updateStreak();
    
    // Check for new badges
    const newBadges = checkAchievements({
      activitiesCount: recent.length + 1,
      isOnboarded: true,
    });
    
    if (newBadges.length > 0) {
      newBadges.forEach(b => {
        const badgeName = t(`badges.${b.id}.name`, b.name);
        toast.achievement(t('challenges.toast.badge_unlocked', "🏆 Unlocked Badge: {badgeName}! {badgeIcon}").replace('{badgeName}', badgeName).replace('{badgeIcon}', b.icon));
      });
    }

    const factorLabel = engine.getFactor(activeCategory, selectedType)?.label;
    const translatedFactor = t(`factor.${activeCategory}.${selectedType}.label`, factorLabel || selectedType);
    toast.success(t('logger.toast.logged_success', "Logged {carbon} kg CO₂ for {activity}")
      .replace('{carbon}', activity.carbonKg)
      .replace('{activity}', translatedFactor));
    setSelectedType('');
    setValue('');
  }, [addActivity, activeCategory, selectedType, value, valInfo.unit, updateStreak, checkAchievements, recent.length, t, toast, engine]);

  return (
    <div className="logger page-enter">
      <div className="logger__header">
        <h1>{t('logger.heading', 'Log Activity')}</h1>
        <p className="logger__subtitle">{t('logger.desc', 'Track your daily carbon footprint')}</p>
      </div>

      {/* Category tabs */}
      <div className="logger__tabs" role="tablist">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              className={`logger__tab ${isActive ? 'logger__tab--active' : ''}`}
              onClick={() => { setActiveCategory(cat.key); setSelectedType(''); }}
              style={isActive ? { '--tab-color': cat.color } : undefined}
              role="tab"
              aria-selected={isActive}
              id={`tab-${cat.key}`}
            >
              <Icon size={18} />
              <span>{t(`category.${cat.key}`, cat.label)}</span>
            </button>
          );
        })}
      </div>

      {/* Activity type selector */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          className="logger__types"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="logger__section-title">{t('logger.section.what_did', 'What did you do?')}</h3>
          <div className="logger__type-grid">
            {activityTypes.map(type => (
              <button
                key={type.key}
                className={`logger__type-btn ${selectedType === type.key ? 'logger__type-btn--selected' : ''}`}
                onClick={() => setSelectedType(type.key)}
                id={`type-${type.key}`}
              >
                <span className="logger__type-label">{t(`factor.${activeCategory}.${type.key}.label`, type.label)}</span>
                <span className="logger__type-factor">{type.factor} {t(`factor.${activeCategory}.${type.key}.unit`, type.unit)}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Value input + submit */}
      {selectedType && (
        <motion.form
          className="logger__form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="logger__input-group">
            <label className="logger__input-label">
              {t(`logger.label.${activeCategory}`, valInfo.label)} ({t(`logger.unit.${activeCategory}`, valInfo.unit)})
            </label>
            <input
              type="number"
              className="logger__input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t(`logger.placeholder.${activeCategory}`, valInfo.placeholder)}
              min="0"
              step="any"
              autoFocus
              id="activity-value-input"
            />
            {/* Quick preset chips */}
            <div className="logger__presets" style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {activeCategory === 'transport' && [5, 10, 20, 50].map(v => (
                <button type="button" key={v} className="logger__preset-chip" onClick={() => setValue(String(v))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '999px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}>
                  {v} km
                </button>
              ))}
              {activeCategory === 'food' && [1, 2, 3].map(v => (
                <button type="button" key={v} className="logger__preset-chip" onClick={() => setValue(String(v))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '999px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}>
                  {v} {v === 1 ? 'meal' : 'meals'}
                </button>
              ))}
              {activeCategory === 'energy' && [2, 4, 8, 12].map(v => (
                <button type="button" key={v} className="logger__preset-chip" onClick={() => setValue(String(v))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '999px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}>
                  {v} hrs
                </button>
              ))}
              {activeCategory === 'shopping' && [1, 2, 5].map(v => (
                <button type="button" key={v} className="logger__preset-chip" onClick={() => setValue(String(v))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '999px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}>
                  {v} {v === 1 ? 'item' : 'items'}
                </button>
              ))}
            </div>
          </div>
          {value && parseFloat(value) > 0 && (
            <motion.div
              className="logger__preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="logger__preview-label">{t('logger.preview.estimated', 'Estimated CO₂:')}</span>
              <span className="logger__preview-value">
                {engine.calculate(activeCategory, selectedType, parseFloat(value))} kg
              </span>
            </motion.div>
          )}
          <button
            type="submit"
            className="logger__submit"
            disabled={!value || parseFloat(value) <= 0}
            id="log-submit-btn"
          >
            <Plus size={18} />
            {t('logger.btn.log', 'Log Activity')}
          </button>
        </motion.form>
      )}

      {/* Recent activities */}
      <div className="logger__recent">
        <h3 className="logger__section-title">{t('logger.section.recent', 'Recent Activity')}</h3>
        {recent.length === 0 ? (
          <div className="logger__empty">
            <p>{t('logger.empty.desc', 'No activities logged yet. Start tracking!')}</p>
          </div>
        ) : (
          <div className="logger__recent-list">
            {recent.map((activity, i) => {
              const factorInfo = engine.getFactor(activity.category, activity.type);
              return (
                <motion.div
                  key={activity.id}
                  className="logger__recent-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <div className={`logger__recent-dot logger__recent-dot--${activity.category}`} />
                  <div className="logger__recent-info">
                    <span className="logger__recent-name">{factorInfo?.label ? t(`factor.${activity.category}.${activity.type}.label`, factorInfo.label) : activity.type}</span>
                    <span className="logger__recent-meta">
                      {activity.value} {t(`logger.unit.${activity.category}`, activity.unit)} · {activity.date}
                    </span>
                  </div>
                  <span className="logger__recent-carbon">{activity.carbonKg} kg</span>
                  <button
                    className="logger__recent-delete"
                    onClick={() => removeActivity(activity.id)}
                    aria-label={t('logger.recent.delete_aria', 'Delete {name} activity').replace('{name}', factorInfo?.label ? t(`factor.${activity.category}.${activity.type}.label`, factorInfo.label) : activity.type)}
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
