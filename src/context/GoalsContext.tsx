import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { GoalsState, GoalsAction, Goal } from '../types';
import { seedGoals } from '../data';

const initialState: GoalsState = {
  goals: seedGoals,
  filter: 'all',
  sort: 'recently-added',
  selectedGoalId: null,
  modal: null,
};

function reducer(state: GoalsState, action: GoalsAction): GoalsState {
  switch (action.type) {
    case 'CREATE_GOAL': return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL': return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g) };
    case 'DELETE_GOAL': return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };
    case 'ADD_DEPOSIT': return {
      ...state,
      goals: state.goals.map(g => g.id === action.payload.goalId
        ? { ...g, deposits: [...g.deposits, action.payload.deposit] }
        : g)
    };
    case 'SET_FILTER': return { ...state, filter: action.payload };
    case 'SET_SORT': return { ...state, sort: action.payload };
    case 'SELECT_GOAL': return { ...state, selectedGoalId: action.payload };
    case 'OPEN_MODAL': return { ...state, modal: action.payload };
    case 'CLOSE_MODAL': return { ...state, modal: null };
    default: return state;
  }
}

interface GoalsContextValue {
  state: GoalsState;
  dispatch: React.Dispatch<GoalsAction>;
}

export const GoalsContext = createContext<GoalsContextValue | null>(null);

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const stored = localStorage.getItem('savings-tracker-goals');
  const parsed = stored ? (JSON.parse(stored) as Goal[]) : seedGoals;
  const [state, dispatch] = useReducer(reducer, { ...initialState, goals: parsed });

  useEffect(() => {
    localStorage.setItem('savings-tracker-goals', JSON.stringify(state.goals));
  }, [state.goals]);

  return <GoalsContext.Provider value={{ state, dispatch }}>{children}</GoalsContext.Provider>;
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
