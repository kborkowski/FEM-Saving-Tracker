import { useGoals } from '../context/GoalsContext';
import { formatCurrency, getTotalSaved, getActiveGoalsCount, getCompletedGoalsCount } from '../utils';

export default function StatsBar() {
  const { state } = useGoals();
  return (
    <div className="stats-bar">
      <div className="stat-card stat-card--total">
        <span className="stat-label">Total savings</span>
        <span className="stat-value">{formatCurrency(getTotalSaved(state.goals))}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Active goals</span>
        <span className="stat-value">{getActiveGoalsCount(state.goals)}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Goals completed</span>
        <span className="stat-value">{getCompletedGoalsCount(state.goals)}</span>
      </div>
    </div>
  );
}
