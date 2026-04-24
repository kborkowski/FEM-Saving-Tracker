import type { CSSProperties } from 'react';
import type { Goal } from '../types';
import { computeProgress, getGoalStatus, formatCurrency, formatDate } from '../utils';
import { useGoals } from '../context/GoalsContext';
import { patternGrid } from '../assets/images';

interface GoalCardProps {
  goal: Goal;
  tall?: boolean;
  tabletWide?: boolean;
  style?: CSSProperties;
}

export default function GoalCard({ goal, tall, tabletWide, style }: GoalCardProps) {
  const { dispatch } = useGoals();
  const progress = computeProgress(goal);
  const status = getGoalStatus(goal);
  const isCompleted = status === 'completed';
  const pct = Math.round(Math.min(progress, 1) * 100);
  const totalSaved = goal.deposits.reduce((sum, d) => sum + d.amount, 0);

  // Color state based purely on progress
  const isFeatured = pct >= 75 && !isCompleted;   // orange bg, white text
  const isInProgress = pct > 0 && pct < 75;        // grey bg, orange %

  const classes = [
    'goal-card',
    isCompleted   ? 'goal-card--completed'   : '',
    isFeatured    ? 'goal-card--featured'    : '',
    isInProgress  ? 'goal-card--in-progress' : '',
    tall          ? 'goal-card--tall'        : '',
    tabletWide    ? 'goal-card--tablet-wide' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      style={style}
      onClick={() => dispatch({ type: 'SELECT_GOAL', payload: goal.id })}
      aria-label={`${goal.name}, ${pct}% saved`}
    >
      <img src={patternGrid} className="goal-card__pattern" aria-hidden="true" alt="" />

      <div className="goal-card__header">
        <span className="goal-card__name">{goal.name}</span>
        {isCompleted && <span className="badge-complete">Complete</span>}
      </div>

      {tall && <div className="goal-card__spacer" />}

      <div className="goal-card__body">
        <div className="goal-card__percentage">{pct}%</div>
        <div className="goal-card__bar-track">
          {pct > 0 && <div className="goal-card__bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />}
        </div>
        <div className="goal-card__meta">
          <span className="goal-card__meta-amount">{formatCurrency(totalSaved)} of {formatCurrency(goal.target)}</span>
          <span className="goal-card__meta-dot" aria-hidden="true" />
          <span className="goal-card__meta-date">{goal.deadline ? `Due ${formatDate(goal.deadline)}` : 'No deadline'}</span>
        </div>
      </div>
    </button>
  );
}
