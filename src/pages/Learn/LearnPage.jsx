import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ecoFacts from '../../data/ecoFacts.json';
import tips from '../../data/tips.json';
import { useLanguage } from '../../context/LanguageContext';
import './LearnPage.css';

const TOPIC_FILTERS = ['all', 'transport', 'food', 'energy', 'shopping', 'general'];
const TOPIC_LABELS = { all: '📚 All', transport: '🚗 Transport', food: '🍔 Food', energy: '⚡ Energy', shopping: '🛍️ Shopping', general: '🌍 General' };

export default function LearnPage() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const getTopicLabel = useCallback((topicId) => {
    const keyMap = {
      all: 'learn.topic.all',
      transport: 'learn.topic.transport',
      food: 'learn.topic.food',
      energy: 'learn.topic.energy',
      shopping: 'learn.topic.shopping',
      general: 'learn.topic.general',
    };
    const englishMap = {
      all: '📚 All',
      transport: '🚗 Transport',
      food: '🍔 Food',
      energy: '⚡ Energy',
      shopping: '🛍️ Shopping',
      general: '🌍 General',
    };
    return t(keyMap[topicId], englishMap[topicId]);
  }, [t]);

  const filteredArticles = useMemo(() => {
    return filter === 'all' ? ecoFacts : ecoFacts.filter(a => a.category === filter);
  }, [filter]);

  const filteredTips = useMemo(() => {
    return filter === 'all' ? tips : tips.filter(t => t.category === filter);
  }, [filter]);

  return (
    <div className="learn page-enter">
      <Link to="/" className="back-home-btn" id="back-home-learn">
        <ArrowLeft size={16} /> {t('common.back_to_home', 'Back to Home')}
      </Link>
      <div className="learn__header">
        <BookOpen size={24} className="learn__header-icon" />
        <h1>{t('learn.heading', 'EcoLearn Hub')}</h1>
        <p className="learn__subtitle">{t('learn.desc', 'Science-backed knowledge for sustainable living')}</p>
      </div>

      {/* Topic filters */}
      <div className="learn__filters">
        {TOPIC_FILTERS.map(f => (
          <button
            key={f}
            className={`learn__filter ${filter === f ? 'learn__filter--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {getTopicLabel(f)}
          </button>
        ))}
      </div>

      {/* Quick facts carousel */}
      <section className="learn__section">
        <h2 className="learn__section-title">{t('learn.section.quick_facts', '💡 Quick Facts')}</h2>
        <div className="learn__facts-scroll">
          {filteredTips.slice(0, 10).map((tip, i) => (
            <motion.div
              key={tip.id}
              className="learn__fact-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <p className="learn__fact-text">{t(`learn.tip.${tip.id}`, tip.text)}</p>
              <span className="learn__fact-category">{t(`category.${tip.category}`, tip.category)}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Articles */}
      <section className="learn__section">
        <h2 className="learn__section-title">{t('learn.section.deep_dives', '📖 Deep Dives')}</h2>
        <div className="learn__articles">
          {filteredArticles.map((article, i) => {
            const isExpanded = expandedId === article.id;
            return (
              <GlassCard key={article.id} className="learn__article" delay={0.05 + i * 0.03}>
                <button
                  className="learn__article-header"
                  onClick={() => setExpandedId(isExpanded ? null : article.id)}
                  id={`article-${article.id}`}
                >
                  <div className="learn__article-meta">
                    <h3>{t(`learn.article.${article.id}.title`, article.title)}</h3>
                    <div className="learn__article-badges">
                      <span className="learn__article-time"><Clock size={12} /> {t(`learn.article.${article.id}.readTime`, article.readTime)}</span>
                      <span className="learn__article-category">{t(`category.${article.category}`, article.category)}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {isExpanded && (
                  <motion.div
                    className="learn__article-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{t(`learn.article.${article.id}.content`, article.content)}</p>
                    <div className="learn__article-tags">
                      {article.tags.map(tag => (
                        <span key={tag} className="learn__tag">#{tag}</span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
