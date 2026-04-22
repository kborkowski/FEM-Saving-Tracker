import { useGoals } from '../context/GoalsContext';
import { formatCurrency, getTotalSaved, getActiveGoalsCount, getCompletedGoalsCount } from '../utils';

export default function StatsBar() {
  const { state } = useGoals();
  const activeCount = getActiveGoalsCount(state.goals);
  const completedCount = getCompletedGoalsCount(state.goals);
  return (
    <div className="stats-bar">
      <div className="stat-card stat-card--total">
        <span className="stat-label">Total savings</span>
        <span className="stat-value">{formatCurrency(getTotalSaved(state.goals), true)}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Active goals</span>
        <span className={`stat-value ${activeCount > 0 ? 'stat-value--active' : 'stat-value--zero'}`}>{activeCount}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Goals completed</span>
        <span className={`stat-value ${completedCount > 0 ? 'stat-value--completed' : 'stat-value--zero'}`}>{completedCount}</span>
      </div>
    </div>
  );
}

