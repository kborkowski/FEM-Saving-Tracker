import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import type { GoalsState, GoalsAction, Goal, Deposit } from '../types';
import { Krbork_savingsgoalsService } from '../generated/services/Krbork_savingsgoalsService';
import { Krbork_depositsService } from '../generated/services/Krbork_depositsService';
import type { Krbork_savingsgoals } from '../generated/models/Krbork_savingsgoalsModel';
import type { Krbork_deposits } from '../generated/models/Krbork_depositsModel';

// --- Mappers ---

function mapGoal(record: Krbork_savingsgoals, deposits: Deposit[]): Goal {
  return {
    id: record.krbork_savingsgoalid,
    name: record.krbork_name ?? '',
    target: record.krbork_targetamount ?? 0,
    deadline: record.krbork_deadline ? record.krbork_deadline.split('T')[0] : null,
    createdAt: record.createdon ?? new Date().toISOString(),
    deposits,
  };
}

function mapDeposit(record: Krbork_deposits): Deposit {
  return {
    id: record.krbork_depositid,
    amount: record.krbork_amount ?? 0,
    note: record.krbork_name ?? '',
    createdAt: record.krbork_depositdate ?? record.createdon ?? new Date().toISOString(),
  };
}

// --- Reducer ---

type InternalAction = GoalsAction | { type: 'SET_GOALS'; payload: Goal[] };

const initialState: GoalsState = {
  goals: [],
  filter: 'all',
  sort: 'recently-added',
  selectedGoalId: null,
  modal: null,
};

function reducer(state: GoalsState, action: InternalAction): GoalsState {
  switch (action.type) {
    case 'SET_GOALS': return { ...state, goals: (action as { type: 'SET_GOALS'; payload: Goal[] }).payload };
    case 'CREATE_GOAL': return { ...state, goals: [...state.goals, (action as GoalsAction & { payload: Goal }).payload] };
    case 'UPDATE_GOAL': {
      const g = (action as GoalsAction & { payload: Goal }).payload;
      return { ...state, goals: state.goals.map(x => x.id === g.id ? g : x) };
    }
    case 'DELETE_GOAL': return { ...state, goals: state.goals.filter(g => g.id !== (action as GoalsAction & { payload: string }).payload) };
    case 'ADD_DEPOSIT': {
      const { goalId, deposit } = (action as GoalsAction & { payload: { goalId: string; deposit: Deposit } }).payload;
      return { ...state, goals: state.goals.map(g => g.id === goalId ? { ...g, deposits: [...g.deposits, deposit] } : g) };
    }
    case 'SET_FILTER': return { ...state, filter: (action as GoalsAction & { payload: GoalsState['filter'] }).payload };
    case 'SET_SORT': return { ...state, sort: (action as GoalsAction & { payload: GoalsState['sort'] }).payload };
    case 'SELECT_GOAL': return { ...state, selectedGoalId: (action as GoalsAction & { payload: string | null }).payload };
    case 'OPEN_MODAL': return { ...state, modal: (action as GoalsAction & { payload: NonNullable<GoalsState['modal']> }).payload };
    case 'CLOSE_MODAL': return { ...state, modal: null };
    default: return state;
  }
}

// --- Context ---

interface GoalsContextValue {
  state: GoalsState;
  dispatch: (action: GoalsAction) => void;
  loading: boolean;
  error: string | null;
}

export const GoalsContext = createContext<GoalsContextValue | null>(null);

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [state, reducerDispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => { loadAllData(); }, []);

  async function loadAllData() {
    setLoading(true);
    setError(null);
    try {
      const [goalsResult, depositsResult] = await Promise.all([
        Krbork_savingsgoalsService.getAll({
          select: ['krbork_savingsgoalid', 'krbork_name', 'krbork_targetamount', 'krbork_deadline', 'createdon'],
          filter: 'statecode eq 0',
          orderBy: ['createdon asc'],
        }),
        Krbork_depositsService.getAll({
          select: ['krbork_depositid', 'krbork_name', 'krbork_amount', 'krbork_depositdate', '_krbork_savingsgoalid_value', 'createdon'],
          filter: 'statecode eq 0',
          orderBy: ['createdon asc'],
        }),
      ]);

      const depositsByGoalId = new Map<string, Deposit[]>();
      for (const d of depositsResult.data ?? []) {
        const goalId = d._krbork_savingsgoalid_value;
        if (!goalId) continue;
        if (!depositsByGoalId.has(goalId)) depositsByGoalId.set(goalId, []);
        depositsByGoalId.get(goalId)!.push(mapDeposit(d));
      }

      const goals = (goalsResult.data ?? []).map(g =>
        mapGoal(g, depositsByGoalId.get(g.krbork_savingsgoalid) ?? [])
      );

      reducerDispatch({ type: 'SET_GOALS', payload: goals });
    } catch {
      setError('Failed to load savings data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }

  const dispatch = useCallback((action: GoalsAction): void => {
    // UI-only actions: pass straight to reducer
    if (['SET_FILTER', 'SET_SORT', 'SELECT_GOAL', 'OPEN_MODAL', 'CLOSE_MODAL'].includes(action.type)) {
      reducerDispatch(action);
      return;
    }

    // Data-mutating actions: call Dataverse, then update local state
    (async () => {
      try {
        switch (action.type) {
          case 'CREATE_GOAL': {
            const g = action.payload;
            const result = await Krbork_savingsgoalsService.create({
              krbork_name: g.name,
              krbork_targetamount: g.target,
              ...(g.deadline ? { krbork_deadline: g.deadline } : {}),
            } as Parameters<typeof Krbork_savingsgoalsService.create>[0]);
            if (result.success && result.data) {
              reducerDispatch({ type: 'CREATE_GOAL', payload: mapGoal(result.data, []) });
            }
            break;
          }
          case 'UPDATE_GOAL': {
            const g = action.payload;
            await Krbork_savingsgoalsService.update(g.id, {
              krbork_name: g.name,
              krbork_targetamount: g.target,
              krbork_deadline: (g.deadline ?? null) as unknown as string,
            } as Parameters<typeof Krbork_savingsgoalsService.update>[1]);
            const existing = stateRef.current.goals.find(x => x.id === g.id);
            reducerDispatch({ type: 'UPDATE_GOAL', payload: { ...g, deposits: existing?.deposits ?? g.deposits } });
            break;
          }
          case 'DELETE_GOAL': {
            await Krbork_savingsgoalsService.delete(action.payload);
            reducerDispatch({ type: 'DELETE_GOAL', payload: action.payload });
            break;
          }
          case 'ADD_DEPOSIT': {
            const { goalId, deposit } = action.payload;
            const result = await Krbork_depositsService.create({
              krbork_name: deposit.note || 'Deposit',
              krbork_amount: deposit.amount,
              krbork_depositdate: deposit.createdAt,
              'krbork_SavingsGoalId@odata.bind': `/krbork_savingsgoals(${goalId})`,
            } as Parameters<typeof Krbork_depositsService.create>[0]);
            if (result.success && result.data) {
              reducerDispatch({ type: 'ADD_DEPOSIT', payload: { goalId, deposit: mapDeposit(result.data) } });
            }
            break;
          }
        }
      } catch {
        // Silent error - UI stays in last known good state
      }
    })();
  }, []);

  return (
    <GoalsContext.Provider value={{ state, dispatch, loading, error }}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const ctx = useContext(GoalsContext);
  if (!ctx) throw new Error('useGoals must be used within GoalsProvider');
  return ctx;
}

export function useGoalById(goalId: string): Goal | undefined {
  const { state } = useGoals();
  return state.goals.find(g => g.id === goalId);
}
