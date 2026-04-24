import { useState, useRef, useEffect, useCallback } from 'react';
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

interface DropdownProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  isOpen: boolean;
  label: string;
  icon: string;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (value: T) => void;
}

function Dropdown<T extends string>({ options, value, isOpen, label, icon, onToggle, onClose, onSelect }: DropdownProps<T>) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Focus active option when dropdown opens
  useEffect(() => {
    if (isOpen && listRef.current) {
      const active = listRef.current.querySelector<HTMLElement>('[aria-selected="true"]')
        ?? listRef.current.querySelector<HTMLElement>('[role="option"]');
      active?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, optValue: T, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(optValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const items = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]');
      items?.[Math.min(index + 1, (items.length ?? 1) - 1)]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const items = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]');
      items?.[Math.max(index - 1, 0)]?.focus();
    } else if (e.key === 'Tab') {
      // Close on Tab so focus naturally moves on
      onClose();
    }
  }, [onSelect, onClose]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="pill-dropdown">
      <button
        ref={triggerRef}
        type="button"
        className="pill-btn"
        onClick={onToggle}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <img src={icon} alt="" />
        {label}
      </button>
      {isOpen && (
        <ul className="pill-dropdown-list" role="listbox" ref={listRef}>
          <li className="pill-dropdown-label" aria-hidden="true">{label}</li>
          {options.map((opt, index) => {
            const isActive = value === opt.value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isActive}
                className={isActive ? 'active' : ''}
                tabIndex={0}
                onClick={() => onSelect(opt.value)}
                onKeyDown={(e) => handleKeyDown(e, opt.value, index)}
              >
                <span className="dropdown-radio">{isActive && <span className="dropdown-radio-dot" />}</span>
                <span className="dropdown-option-text">{opt.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
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

  // Close on outside click
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
          <div ref={filterRef}>
            <Dropdown
              options={FILTER_OPTIONS}
              value={state.filter}
              isOpen={filterOpen}
              label={state.filter === 'all' ? 'Filters' : currentFilterLabel}
              icon={iconFilter}
              onToggle={() => { setFilterOpen(v => !v); setSortOpen(false); }}
              onClose={() => setFilterOpen(false)}
              onSelect={(v) => { dispatch({ type: 'SET_FILTER', payload: v }); setFilterOpen(false); }}
            />
          </div>

          <div ref={sortRef}>
            <Dropdown
              options={SORT_OPTIONS}
              value={state.sort}
              isOpen={sortOpen}
              label={state.sort === 'recently-added' ? 'Sort by' : currentSortLabel}
              icon={iconSort}
              onToggle={() => { setSortOpen(v => !v); setFilterOpen(false); }}
              onClose={() => setSortOpen(false)}
              onSelect={(v) => { dispatch({ type: 'SET_SORT', payload: v }); setSortOpen(false); }}
            />
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <img src={iconTarget} alt="" />
          <p>No goals yet. Add your first savings goal to get started.</p>
          <button
            type="button"
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
