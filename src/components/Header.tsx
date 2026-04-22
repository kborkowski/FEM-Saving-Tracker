import { useGoals } from '../context/GoalsContext';
import logoSmall from '../assets/images/logo-small.svg';
import iconPlus from '../assets/images/icon-plus.svg';

declare const __APP_VERSION__: string;

export default function Header() {
  const { dispatch } = useGoals();
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-logo">
          <img src={logoSmall} alt="Savings Tracker" />
          <span className="header-logo-text">Savings Tracker</span>
          <span className="header-version">v{__APP_VERSION__}</span>
        </div>
        <button
          className="btn-pill"
          onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'create-goal' } })}
        >
          <img src={iconPlus} alt="" />
          New goal
        </button>
      </div>
    </header>
  );
}
