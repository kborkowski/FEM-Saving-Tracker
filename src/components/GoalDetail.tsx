import { useState } from 'react';
import { useGoalById, useGoals } from '../context/GoalsContext';
import { computeProgress, getGoalStatus, formatCurrency, formatDate, generateId } from '../utils';
import iconChevronLeft from '../assets/images/icon-chevron-left.svg';
import iconCheckmark from '../assets/images/icon-checkmark.svg';
import iconArrowDown from '../assets/images/icon-arrow-down.svg';
import iconError from '../assets/images/icon-error.svg';
import iconDollar from '../assets/images/icon-dollar.svg';

interface GoalDetailProps {
  goalId: string;
}

export default function GoalDetail({ goalId }: GoalDetailProps) {
  const goal = useGoalById(goalId);
  const { dispatch } = useGoals();
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [depositError, setDepositError] = useState('');

  if (!goal) return null;

  const progress = computeProgress(goal);
  const status = getGoalStatus(goal);
  const isCompleted = status === 'completed';
  const pct = Math.round(Math.min(progress, 1) * 100);
  const totalSaved = goal.deposits.reduce((sum, d) => sum + d.amount, 0);
  const remaining = Math.max(goal.target - totalSaved, 0);
  const sortedDeposits = [...goal.deposits].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  function handleAddDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal) return;
    const amount = parseFloat(depositAmount);
    if (!depositAmount || isNaN(amount) || amount <= 0) {
      setDepositError('Please enter a valid amount');
      return;
    }
    setDepositError('');
    dispatch({
      type: 'ADD_DEPOSIT',
      payload: {
        goalId: goal.id,
        deposit: {
          id: generateId(),
          amount,
          note: depositNote.trim(),
          createdAt: new Date().toISOString(),
        },
      },
    });
    setDepositAmount('');
    setDepositNote('');
  }

  const depositPanel = (
    <div className="goal-deposit-panel">
      <div className="deposit-panel-header">
        <span className="deposit-panel-title">Deposit history</span>
        <span className="deposit-panel-count">{sortedDeposits.length} deposits</span>
      </div>
      <div className="deposit-panel-items">
        {sortedDeposits.length === 0 ? (
          <p className="deposit-empty">No deposits yet.</p>
        ) : (
          sortedDeposits.map((dep, i) => (
            <div key={dep.id}>
              {i === 0 && <div className="deposit-item-divider" />}
              <div className="deposit-item">
                <div className="deposit-item-icon">
                  <img src={iconArrowDown} alt="" />
                </div>
                <div className="deposit-item-info">
                  <span className="deposit-item-note">{dep.note || 'Deposit'}</span>
                  <span className="deposit-item-date">{formatDate(dep.createdAt)}</span>
                </div>
                <span className="deposit-item-amount">{formatCurrency(dep.amount)}</span>
              </div>
              <div className="deposit-item-divider" />
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="goal-detail">
      {/* Topbar */}
      <div className="goal-detail-topbar">
        <button
          type="button"
          className="goal-detail-back"
          onClick={() => dispatch({ type: 'SELECT_GOAL', payload: null })}
        >
          <img src={iconChevronLeft} alt="" />
          Back
        </button>
        <div className="goal-detail-actions">
          {!isCompleted && (
            <button
              type="button"
              className="detail-action-btn"
              onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'edit-goal', goalId: goal.id } })}
            >
              Edit goal
            </button>
          )}
          <button
            type="button"
            className="detail-action-btn detail-action-btn--danger"
            onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'delete-goal', goalId: goal.id } })}
          >
            Delete goal
          </button>
        </div>
      </div>

      {/* Title */}
      <h2 className="goal-detail-name">{goal.name}</h2>

      {/* Date info */}
      <div className="goal-detail-dates">
        {goal.deadline && (
          <>
            <span>Due {formatDate(goal.deadline)}</span>
            <span aria-hidden="true">•</span>
          </>
        )}
        <span>Created {formatDate(goal.createdAt)}</span>
      </div>

      {isCompleted ? (
        /* ── COMPLETED: gradient hero card (left) + deposit history (right) ── */
        <div className="goal-section">
          <div className="goal-card-hero">
            <div className="goal-hero-badge">
              <img src={iconCheckmark} alt="Complete" />
            </div>
            <div className="goal-hero-summary">
              <div className="goal-hero-amount">100%</div>
              <div className="goal-hero-status">
                <div className="goal-hero-title">Goal Complete</div>
                <div className="goal-hero-subtitle">
                  You saved {formatCurrency(totalSaved, true)} across {goal.deposits.length} deposit{goal.deposits.length !== 1 ? 's' : ''}.
                  {goal.deadline && ` Finished before your ${formatDate(goal.deadline)} deadline.`}
                </div>
                <div className="goal-hero-stats">
                  <div className="goal-hero-stat">
                    <div className="goal-hero-stat-value">{goal.deposits.length}</div>
                    <div className="goal-hero-stat-label">DEPOSITS</div>
                  </div>
                  <div className="goal-hero-divider" />
                  <div className="goal-hero-stat">
                    <div className="goal-hero-stat-value">{formatCurrency(totalSaved, true)}</div>
                    <div className="goal-hero-stat-label">TOTAL SAVED</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {depositPanel}
        </div>
      ) : (
        /* ── IN-PROGRESS: progress card + deposit form (left) + deposit history (right) ── */
        <div className="goal-section">
          <div className="goal-details-left">
            {/* Progress card */}
            <div className="goal-progress-card">
              <div className="progress-info">
                <span className="progress-pct">{pct}%</span>
                <span className="progress-remaining">{formatCurrency(remaining, true)} remaining</span>
              </div>
              <div className="progress-bar-section">
                <div className="progress-track">
                  {pct > 0 && <div className="progress-fill" style={{ width: `${pct}%` }} />}
                </div>
                <div className="progress-summary">
                  <div className="progress-amount-info">
                    <span className="progress-amount-value">{formatCurrency(totalSaved, true)}</span>
                     <span className="progress-amount-label">Saved so far</span>
                  </div>
                  <div className="progress-amount-info progress-amount-info--end">
                    <span className="progress-amount-value">{formatCurrency(goal.target, true)}</span>
                    <span className="progress-amount-label">Target</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inline deposit form */}
            <form className="goal-deposit-form-card" onSubmit={handleAddDeposit}>
              <h3 className="deposit-form-title">Add deposit</h3>
              <div className="deposit-form-fields">
                <div className="deposit-form-field">
                  <label className="deposit-form-label" htmlFor="deposit-amount">Amount</label>
                  <div className="deposit-input-wrapper">
                    <img src={iconDollar} className="deposit-input-icon" alt="" />
                    <input
                      id="deposit-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      className={`deposit-text-input deposit-text-input--icon${depositError ? ' deposit-text-input--error' : ''}`}
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={e => { setDepositAmount(e.target.value); setDepositError(''); }}
                    />
                  </div>
                  {depositError && (
                    <div className="deposit-form-error">
                      <img src={iconError} alt="" width="20" height="20" />
                      <span>{depositError}</span>
                    </div>
                  )}
                </div>
                <div className="deposit-form-field">
                  <label className="deposit-form-label" htmlFor="deposit-note">Note (optional)</label>
                  <div className="deposit-input-wrapper">
                    <input
                      id="deposit-note"
                      type="text"
                      className="deposit-text-input"
                      placeholder="e.g. Monthly savings"
                      value={depositNote}
                      onChange={e => setDepositNote(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="deposit-submit-btn">
                Add funds
              </button>
            </form>
          </div>
          {depositPanel}
        </div>
      )}
    </div>
  );
}
