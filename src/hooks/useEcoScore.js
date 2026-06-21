import { useLocalStorage } from './useLocalStorage';
import { useCarbonEngine } from './useCarbonEngine';

export function useEcoScore() {
  const [scores, setScores] = useLocalStorage('scores', {
    current: 50,
    history: [],
    categoryBreakdown: { transport: 25, food: 25, energy: 25, shopping: 25 },
  });
  const engine = useCarbonEngine();

  const updateScore = (dailyCarbonKg, breakdown) => {
    const newScore = engine.calculateEcoScore(dailyCarbonKg);
    const today = new Date().toISOString().split('T')[0];

    setScores(prev => {
      // Update or append today's entry
      const history = [...prev.history];
      const todayIdx = history.findIndex(h => h.date === today);
      const entry = { date: today, score: newScore, carbonKg: Math.round(dailyCarbonKg * 10) / 10 };

      if (todayIdx >= 0) {
        history[todayIdx] = entry;
      } else {
        history.push(entry);
      }

      // Keep last 90 days
      const trimmed = history.slice(-90);

      return {
        current: newScore,
        history: trimmed,
        categoryBreakdown: breakdown || prev.categoryBreakdown,
      };
    });

    return newScore;
  };

  const initFromQuiz = (quiz) => {
    const score = engine.scoreFromQuiz(quiz);
    const dailyCarbon = engine.dailyCarbonFromQuiz(quiz);
    const today = new Date().toISOString().split('T')[0];

    // Generate 7 days of sample history based on quiz
    const history = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const variance = (Math.random() - 0.5) * 4;
      const dayCarbon = Math.max(0, dailyCarbon + variance);
      history.push({
        date: d.toISOString().split('T')[0],
        score: engine.calculateEcoScore(dayCarbon),
        carbonKg: Math.round(dayCarbon * 10) / 10,
      });
    }

    setScores({
      current: score,
      history,
      categoryBreakdown: { transport: 30, food: 28, energy: 25, shopping: 17 },
    });

    return score;
  };

  return {
    score: scores.current,
    history: scores.history,
    categoryBreakdown: scores.categoryBreakdown,
    updateScore,
    initFromQuiz,
  };
}
