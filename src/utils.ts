import type { Goal, GoalStatus, FilterType, SortType } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
}

export function computeProgress(goal: Goal): number {
  if (goal.target <= 0) return 0;
  const total = goal.deposits.reduce((sum, d) => sum + d.amount, 0);
  return total / goal.target;
}

export function getGoalStatus(goal: Goal): GoalStatus {
  if (goal.deposits.length === 0) return 'not-started';
  if (computeProgress(goal) >= 1) return 'completed';
  return 'in-progress';
}

export function getTotalSaved(goals: Goal[]): number {
  return goals.reduce((sum, g) => sum + g.deposits.reduce((s, d) => s + d.amount, 0), 0);
}

export function getActiveGoalsCount(goals: Goal[]): number {
  return goals.filter(g => getGoalStatus(g) === 'in-progress').length;
}

export function getCompletedGoalsCount(goals: Goal[]): number {
  return goals.filter(g => getGoalStatus(g) === 'completed').length;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function getMonthlyTotals(goals: Goal[]): { month: string; total: number }[] {
  const map = new Map<string, number>();
  for (const goal of goals) {
    for (const dep of goal.deposits) {
      const d = new Date(dep.createdAt);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) ?? 0) + dep.amount);
    }
  }
  if (map.size === 0) return [];

  // Build a continuous range from the earliest deposit month to today
  const allKeys = Array.from(map.keys()).sort();
  const earliest = allKeys[0];
  const now = new Date();
  const endKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

  const result: { month: string; total: number }[] = [];
  let [y, m] = earliest.split('-').map(Number);
  const [ey, em] = endKey.split('-').map(Number);

  while (y < ey || (y === ey && m <= em)) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    result.push({ month: MONTHS[m - 1], total: map.get(key) ?? 0 });
    m++;
    if (m > 12) { m = 1; y++; }
  }

  return result;
}

export function sortGoals(goals: Goal[], sort: SortType): Goal[] {
  const arr = [...goals];
  switch (sort) {
    case 'recently-added':
      return arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'deadline':
      return arr.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    case 'progress':
      return arr.sort((a, b) => computeProgress(b) - computeProgress(a));
    case 'amount-saved': {
      const saved = (g: Goal) => g.deposits.reduce((s, d) => s + d.amount, 0);
      return arr.sort((a, b) => saved(b) - saved(a));
    }
    case 'alphabetical':
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return arr;
  }
}

export function filterGoals(goals: Goal[], filter: FilterType): Goal[] {
  if (filter === 'all') return goals;
  return goals.filter(g => getGoalStatus(g) === filter);
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
