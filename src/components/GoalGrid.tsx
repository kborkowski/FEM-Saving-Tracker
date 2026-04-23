import { useState, useRef, useEffect } from 'react';
import { useGoals } from '../context/GoalsContext';
import { filterGoals, sortGoals } from '../utils';
import GoalCard from './GoalCard';
import type { FilterType, SortType } from '../types';
import iconFilter from '../assets/images/icon-filter.svg';
import iconSort from '../assets/images/icon-sort.svg';
import iconTarget from '../assets/images/icon-target.svg';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All Goals' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'not-started', label: 'Not Started' },
];

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'recently-added', label: 'Recently Added' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'progress', label: 'Progress' },
  { value: 'amount-saved', label: 'Amount Saved' },
  { value: 'alphabetical', label: 'Alphabetical' },
];

// Span rules by position within each group of 8
// pos 0 → wide (span 2 cols), pos 1 → tall (span 2 rows)
// pos 4 → tall (span 2 rows), pos 5 → wide (span 2 cols)
function desktopCardStyle(posInGroup: number): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (posInGroup === 0 || posInGroup === 5) style.gridColumn = 'span 2';
  if (posInGroup === 1 || posInGroup === 4) style.gridRow = 'span 2';
  return style;
}

export default function GoalGrid() {
  const { state, dispatch } = useGoals();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const filtered = filterGoals(state.goals, state.filter);
  const sorted = sortGoals(filtered, state.sort);

  const currentFilterLabel = FILTER_OPTIONS.find(o => o.value === state.filter)?.label ?? 'Filters';
  const currentSortLabel = SORT_OPTIONS.find(o => o.value === state.sort)?.label ?? 'Sort by';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <section className="goal-grid-section">
      <div className="goal-grid-header">
        <h2 className="goal-grid-title">Your goals</h2>
        <div className="goal-grid-controls">
          <div className="pill-dropdown" ref={filterRef}>
            <button
              className="pill-btn"
              onClick={() => { setFilterOpen(v => !v); setSortOpen(false); }}
              aria-expanded={filterOpen}
            >
              <img src={iconFilter} alt="" />
              {state.filter === 'all' ? 'Filters' : currentFilterLabel}
            </button>
            {filterOpen && (
              <ul className="pill-dropdown-list" role="listbox">
                <li className="pill-dropdown-label">Filter by</li>
                {FILTER_OPTIONS.map(opt => {
                  const isActive = state.filter === opt.value;
                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isActive}
                      className={isActive ? 'active' : ''}
                      onClick={() => { dispatch({ type: 'SET_FILTER', payload: opt.value }); setFilterOpen(false); }}
                    >
                      <span className="dropdown-radio">{isActive && <span className="dropdown-radio-dot" />}</span>
                      <span className="dropdown-option-text">{opt.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="pill-dropdown" ref={sortRef}>
            <button
              className="pill-btn"
              onClick={() => { setSortOpen(v => !v); setFilterOpen(false); }}
              aria-expanded={sortOpen}
            >
              <img src={iconSort} alt="" />
              {state.sort === 'recently-added' ? 'Sort by' : currentSortLabel}
            </button>
            {sortOpen && (
              <ul className="pill-dropdown-list" role="listbox">
                <li className="pill-dropdown-label">Sort by</li>
                {SORT_OPTIONS.map(opt => {
                  const isActive = state.sort === opt.value;
                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isActive}
                      className={isActive ? 'active' : ''}
                      onClick={() => { dispatch({ type: 'SET_SORT', payload: opt.value }); setSortOpen(false); }}
                    >
                      <span className="dropdown-radio">{isActive && <span className="dropdown-radio-dot" />}</span>
                      <span className="dropdown-option-text">{opt.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <img src={iconTarget} alt="" />
          <p>No goals yet. Add your first savings goal to get started.</p>
          <button
            className="btn-pill"
            onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'create-goal' } })}
          >
            + Add Goal
          </button>
        </div>
      ) : (
        <>
          <div className="goal-grid goal-grid--desktop">
            {sorted.map((goal, i) => {
              const posInGroup = i % 8;
              const isTall = posInGroup === 1 || posInGroup === 4;
              return (
                <GoalCard
                  key={`desktop-${goal.id}`}
                  goal={goal}
                  tall={isTall}
                  style={desktopCardStyle(posInGroup)}
                />
              );
            })}
          </div>

          <div className="goal-grid goal-grid--mobile">
            {sorted.map((goal, i) => {
              const posInGroup = i % 8;
              const isTabletWide = posInGroup === 0 || posInGroup === 3 || posInGroup === 4 || posInGroup === 7;
              return (
                <GoalCard
                  key={`mobile-${goal.id}`}
                  goal={goal}
                  tabletWide={isTabletWide}
                />
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
