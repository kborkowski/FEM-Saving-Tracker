export interface Deposit {
  id: string;
  amount: number;
  note: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  deadline: string | null;
  createdAt: string;
  deposits: Deposit[];
}

export type GoalStatus = 'not-started' | 'in-progress' | 'completed';

export type FilterType = 'all' | 'in-progress' | 'completed' | 'not-started';
export type SortType = 'recently-added' | 'deadline' | 'progress' | 'amount-saved' | 'alphabetical';

export type ModalState =
  | null
  | { type: 'create-goal' }
  | { type: 'edit-goal'; goalId: string }
  | { type: 'delete-goal'; goalId: string }
  | { type: 'add-deposit'; goalId: string };

export interface GoalsState {
  goals: Goal[];
  filter: FilterType;
  sort: SortType;
  selectedGoalId: string | null;
  modal: ModalState;
}

export type GoalsAction =
  | { type: 'CREATE_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_DEPOSIT'; payload: { goalId: string; deposit: Deposit } }
  | { type: 'SET_FILTER'; payload: FilterType }
  | { type: 'SET_SORT'; payload: SortType }
  | { type: 'SELECT_GOAL'; payload: string | null }
  | { type: 'OPEN_MODAL'; payload: NonNullable<ModalState> }
  | { type: 'CLOSE_MODAL' };
