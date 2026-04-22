import { useState, useRef, useEffect } from 'react';
import { useGoals } from '../context/GoalsContext';
import { filterGoals, sortGoals } from '../utils';
import GoalCard from './GoalCard';
import type { FilterType, SortType, Goal } from '../types';
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

const DESKTOP_SOURCE_MAP = [0, 1, 2, 3, 7, 4, 5, 6];

const DESKTOP_PLACEMENT = [
  { gridColumn: '1 / span 2', gridRow: '1' },
  { gridColumn: '3',           gridRow: '1 / span 2' },
  { gridColumn: '1',           gridRow: '2' },
  { gridColumn: '2',           gridRow: '2' },
  { gridColumn: '1',           gridRow: '3 / span 2' },
  { gridColumn: '2 / span 2', gridRow: '3' },
  { gridColumn: '2',           gridRow: '4' },
  { gridColumn: '3',           gridRow: '4' },
];

function getDesktopItems(goals: Goal[]) {
  const items: { goal: Goal; vi: number; groupIndex: number }[] = [];
  const totalGroups = Math.ceil(goals.length / 8);
  for (let g = 0; g < totalGroups; g++) {
    for (let vi = 0; vi < 8; vi++) {
      const srcOffset = DESKTOP_SOURCE_MAP[vi];
      const srcIdx = g * 8 + srcOffset;
      if (srcIdx < goals.length) {
        items.push({ goal: goals[srcIdx], vi, groupIndex: g });
      }
    }
  }
  return items;
}

function getDesktopStyle(vi: number, groupIndex: number): React.CSSProperties {
  const p = DESKTOP_PLACEMENT[vi];
  const rowOffset = groupIndex * 4;
  const adjustRow = (r: string) => r.replace(/(\d+)/g, m => String(parseInt(m) + rowOffset));
  return {
    gridColumn: p.gridColumn,
    gridRow: adjustRow(p.gridRow),
  };
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

  const desktopItems = getDesktopItems(sorted);
  const totalRows = Math.ceil(sorted.length / 8) * 4;

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
          <div
            className="goal-grid goal-grid--desktop"
            style={{ gridTemplateRows: `repeat(${totalRows}, 240px)` }}
          >
            {desktopItems.map(({ goal, vi, groupIndex }) => {
              const isCompleted = goal.deposits.reduce((s, d) => s + d.amount, 0) >= goal.target;
              const isFeatured = (vi === 0 || vi === 5) && !isCompleted;
              const isTall = vi === 1 || vi === 4;
              const style = getDesktopStyle(vi, groupIndex);
              return (
                <GoalCard
                  key={`desktop-${goal.id}-${groupIndex}`}
                  goal={goal}
                  featured={isFeatured}
                  tall={isTall}
                  style={style}
                />
              );
            })}
          </div>

          <div className="goal-grid goal-grid--mobile">
            {sorted.map((goal, i) => {
              const posInGroup = i % 8;
              const isCompleted = goal.deposits.reduce((s, d) => s + d.amount, 0) >= goal.target;
              const isFeatured = (posInGroup === 0 || posInGroup === 4) && !isCompleted;
              const isTabletWide = posInGroup === 0 || posInGroup === 3 || posInGroup === 4 || posInGroup === 7;
              return (
                <GoalCard
                  key={`mobile-${goal.id}`}
                  goal={goal}
                  featured={isFeatured}
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
