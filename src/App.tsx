import { GoalsProvider, useGoals } from './context/GoalsContext';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import MonthlyChart from './components/MonthlyChart';
import GoalGrid from './components/GoalGrid';
import GoalDetail from './components/GoalDetail';
import GoalModal from './components/modals/GoalModal';
import DeleteModal from './components/modals/DeleteModal';
import DepositModal from './components/modals/DepositModal';

function AppContent() {
  const { state, loading, error } = useGoals();
  return (
    <div className="app">
      <Header />
      {loading && (
        <div className="data-loading">
          <div className="data-loading__spinner" />
          <p>Loading your savings data…</p>
        </div>
      )}
      {error && !loading && (
        <div className="data-error">{error}</div>
      )}
      {!loading && !error && state.selectedGoalId ? (
        <GoalDetail goalId={state.selectedGoalId} />
      ) : (
        !loading && !error && (
        <main className="dashboard">
          <StatsBar />
          <MonthlyChart />
          <GoalGrid />
        </main>
        )
      )}
      {state.modal && (
        <>
          {state.modal.type === 'create-goal' && <GoalModal />}
          {state.modal.type === 'edit-goal' && <GoalModal goalId={state.modal.goalId} />}
          {state.modal.type === 'delete-goal' && <DeleteModal goalId={state.modal.goalId} />}
          {state.modal.type === 'add-deposit' && <DepositModal goalId={state.modal.goalId} />}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <GoalsProvider>
      <AppContent />
    </GoalsProvider>
  );
}
