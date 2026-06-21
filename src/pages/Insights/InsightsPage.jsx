import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingDown, Calendar, Award, Target, ArrowLeft } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { useActivities } from '../../hooks/useActivities';
import { useEcoScore } from '../../hooks/useEcoScore';
import nationalAverages from '../../data/nationalAverages.json';
import { useLanguage } from '../../context/LanguageContext';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';
import './InsightsPage.css';

const CATEGORY_COLORS = ['#f472b6', '#fb923c', '#facc15', '#a78bfa'];
const CATEGORY_NAMES = { transport: 'Transport', food: 'Food', energy: 'Energy', shopping: 'Shopping' };

export default function InsightsPage() {
  const { getWeeklyData, getCategoryBreakdown, getTotalCarbon, activities } = useActivities();
  const { score, history } = useEcoScore();
  const { t } = useLanguage();
  const [compareRegion, setCompareRegion] = useState('global');

  const weeklyData = useMemo(() => getWeeklyData(), [getWeeklyData, activities]);
  const breakdown = useMemo(() => getCategoryBreakdown(), [getCategoryBreakdown, activities]);
  const totalCarbon = useMemo(() => getTotalCarbon(), [getTotalCarbon, activities]);

  const pieData = useMemo(() => {
    return Object.entries(breakdown).map(([key, value]) => ({
      name: t(`category.${key}`, CATEGORY_NAMES[key]), value, key,
    }));
  }, [breakdown, t]);

  const avgDaily = useMemo(() => {
    return weeklyData.length > 0
      ? Math.round((weeklyData.reduce((s, d) => s + d.carbonKg, 0) / weeklyData.length) * 10) / 10
      : 0;
  }, [weeklyData]);

  const bestDay = useMemo(() => {
    return weeklyData.reduce((best, d) => (!best || d.carbonKg < best.carbonKg) ? d : best, null);
  }, [weeklyData]);

  const regionData = useMemo(() => {
    return nationalAverages[compareRegion];
  }, [compareRegion]);

  const comparisonData = useMemo(() => {
    return [
      { name: t('comparison.you', 'You'), value: avgDaily, fill: '#00d4aa' },
      { name: t(`comparison.region.${compareRegion}`, regionData?.label || 'Average'), value: regionData?.dailyKg || 12.9, fill: '#60a5fa' },
      { name: t('comparison.sustainable', 'Sustainable Target'), value: nationalAverages.sustainable_target.dailyKg, fill: '#34d399' },
    ];
  }, [avgDaily, compareRegion, regionData, t]);

  return (
    <div className="insights page-enter">
      <Link to="/" className="back-home-btn" id="back-home-insights">
        <ArrowLeft size={16} /> {t('common.back_to_home', 'Back to Home')}
      </Link>
      <div className="insights__header">
        <h1>{t('insights.heading', 'Insights & Analytics')}</h1>
        <p className="insights__subtitle">{t('insights.desc', 'Understand your carbon impact')}</p>
      </div>

      {/* Stat cards */}
      <div className="insights__stats">
        <GlassCard className="insights__stat" delay={0.05}>
          <TrendingDown size={20} className="insights__stat-icon" style={{ color: 'var(--color-primary-400)' }} />
          <div className="insights__stat-value">
            <AnimatedCounter value={avgDaily} decimals={1} suffix=" kg" />
          </div>
          <div className="insights__stat-label">{t('insights.stat.avg_daily', 'Avg Daily CO₂')}</div>
        </GlassCard>
        <GlassCard className="insights__stat" delay={0.1}>
          <Calendar size={20} className="insights__stat-icon" style={{ color: 'var(--color-info)' }} />
          <div className="insights__stat-value">
            <AnimatedCounter value={totalCarbon} decimals={1} suffix=" kg" />
          </div>
          <div className="insights__stat-label">{t('insights.stat.total_tracked', 'Total Tracked')}</div>
        </GlassCard>
        <GlassCard className="insights__stat" delay={0.15}>
          <Award size={20} className="insights__stat-icon" style={{ color: 'var(--color-success)' }} />
          <div className="insights__stat-value">{bestDay?.day ? t(`days.${bestDay.day.toLowerCase()}`, bestDay.day) : '—'}</div>
          <div className="insights__stat-label">{t('insights.stat.best_day', 'Best Day ({val} kg)').replace('{val}', bestDay?.carbonKg ?? 0)}</div>
        </GlassCard>
        <GlassCard className="insights__stat" delay={0.2}>
          <Target size={20} className="insights__stat-icon" style={{ color: 'var(--color-success)' }} />
          <div className="insights__stat-value">
            <AnimatedCounter value={score} decimals={0} />
          </div>
          <div className="insights__stat-label">{t('results.score.title', 'Eco Score')}</div>
        </GlassCard>
      </div>

      {/* Weekly trend chart */}
      <GlassCard className="insights__chart-card" delay={0.25}>
        <h3>{t('insights.chart.weekly_trend', 'Weekly Carbon Trend')}</h3>
        <div className="insights__chart">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tickFormatter={(day) => t(`days.${day.toLowerCase()}`, day)} tick={{ fill: '#8892a8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8892a8', fontSize: 12 }} axisLine={false} tickLine={false} unit=" kg" />
              <Tooltip
                contentStyle={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f4ff', fontSize: 13 }}
                formatter={(v) => [`${v} kg CO₂`, t('insights.carbon', 'Carbon')]}
              />
              <Line type="monotone" dataKey="carbonKg" stroke="#00d4aa" strokeWidth={3} dot={{ fill: '#00d4aa', r: 4 }} activeDot={{ r: 6 }} animationDuration={500} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="insights__row">
        {/* Category donut */}
        <GlassCard className="insights__chart-card insights__chart-card--half" delay={0.3}>
          <h3>{t('insights.chart.category_breakdown', 'Category Breakdown')}</h3>
          <div className="insights__chart">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" animationBegin={0} animationDuration={500}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f4ff', fontSize: 13 }}
                  formatter={(v) => [`${v}%`, t('insights.share', 'Share')]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#8892a8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Comparison bar */}
        <GlassCard className="insights__chart-card insights__chart-card--half" delay={0.35}>
          <div className="insights__compare-header">
            <h3>{t('insights.chart.how_compare', 'How You Compare')}</h3>
            <select
              className="insights__compare-select"
              value={compareRegion}
              onChange={(e) => setCompareRegion(e.target.value)}
              id="compare-region-select"
            >
              {Object.entries(nationalAverages).filter(([k]) => k !== 'sustainable_target').map(([key, val]) => (
                <option key={key} value={key}>{t(`comparison.region.${key}`, val.label)}</option>
              ))}
            </select>
          </div>
          <div className="insights__chart">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={comparisonData} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#8892a8', fontSize: 12 }} axisLine={false} tickLine={false} unit=" kg" />
                <YAxis type="category" dataKey="name" tick={{ fill: '#8892a8', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f4ff', fontSize: 13 }}
                  formatter={(v) => [`${v} kg CO₂/day`, t('insights.daily_avg', 'Daily Average')]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={500}>
                  {comparisonData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Score history */}
      {history.length > 1 && (
        <GlassCard className="insights__chart-card" delay={0.4}>
          <h3>{t('insights.chart.score_history', 'Eco Score History')}</h3>
          <div className="insights__chart">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={{ fill: '#8892a8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis domain={[0, 100]} tick={{ fill: '#8892a8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f4ff', fontSize: 13 }}
                  formatter={(v) => [`${v}`, t('results.score.title', 'Eco Score')]}
                />
                <Line type="monotone" dataKey="score" stroke="#4cc9f0" strokeWidth={2.5} dot={{ fill: '#4cc9f0', r: 3 }} animationDuration={500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
