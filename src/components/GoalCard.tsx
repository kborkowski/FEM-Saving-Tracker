import type { CSSProperties } from 'react';
import type { Goal } from '../types';
import { computeProgress, getGoalStatus, formatCurrency, formatDate } from '../utils';
import { useGoals } from '../context/GoalsContext';

interface GoalCardProps {
  goal: Goal;
  featured?: boolean;
  tall?: boolean;
  tabletWide?: boolean;
  style?: CSSProperties;
}

export default function GoalCard({ goal, featured, tall, tabletWide, style }: GoalCardProps) {
  const { dispatch } = useGoals();
  const progress = computeProgress(goal);
  const status = getGoalStatus(goal);
  const isCompleted = status === 'completed';
  const pct = Math.round(Math.min(progress, 1) * 100);
  const totalSaved = goal.deposits.reduce((sum, d) => sum + d.amount, 0);

  const classes = [
    'goal-card',
    isCompleted ? 'goal-card--completed' : '',
    featured ? 'goal-card--featured' : '',
    tall ? 'goal-card--tall' : '',
    tabletWide ? 'goal-card--tablet-wide' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={style}
      onClick={() => dispatch({ type: 'SELECT_GOAL', payload: goal.id })}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && dispatch({ type: 'SELECT_GOAL', payload: goal.id })}
      aria-label={`${goal.name}, ${pct}% saved`}
    >
      <div className="goal-card__header">
        <span className="goal-card__name">{goal.name}</span>
        {isCompleted && <span className="badge-complete">Complete</span>}
      </div>

      {tall && <div className="goal-card__spacer" />}

      <div className="goal-card__percentage">{pct}%</div>
      <div className="goal-card__bar-track">
        <div className="goal-card__bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <div className="goal-card__meta">
        {formatCurrency(totalSaved)} of {formatCurrency(goal.target)}
        {goal.deadline ? ` · Due ${formatDate(goal.deadline)}` : ' · No deadline'}
      </div>
    </div>
  );
}
