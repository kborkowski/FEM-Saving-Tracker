import { useState } from 'react';
import Modal from './Modal';
import { useGoals, useGoalById } from '../../context/GoalsContext';
import { generateId } from '../../utils';
import iconError from '../../assets/images/icon-error.svg';

interface DepositModalProps {
  goalId: string;
}

export default function DepositModal({ goalId }: DepositModalProps) {
  const { dispatch } = useGoals();
  const goal = useGoalById(goalId);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleClose = () => dispatch({ type: 'CLOSE_MODAL' });

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }
    dispatch({
      type: 'ADD_DEPOSIT',
      payload: {
        goalId,
        deposit: {
          id: generateId(),
          amount: amountNum,
          note: note.trim(),
          createdAt: new Date().toISOString(),
        },
      },
    });
    dispatch({ type: 'CLOSE_MODAL' });
  };

  return (
    <Modal title={`Add Deposit${goal ? ` — ${goal.name}` : ''}`} onClose={handleClose}>
      <div className="form-group">
        <label className="form-label" htmlFor="deposit-amount">Amount</label>
        <div className="form-input-wrapper">
          <span className="form-input-prefix">$</span>
          <input
            id="deposit-amount"
            className={`form-input has-prefix${error ? ' error' : ''}`}
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={e => { setAmount(e.target.value); setError(undefined); }}
            placeholder="0.00"
          />
        </div>
        {error && (
          <div className="form-error">
            <img src={iconError} alt="" />
            {error}
          </div>
        )}
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="deposit-note">Note (optional)</label>
        <input
          id="deposit-note"
          className="form-input"
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. Monthly savings"
        />
      </div>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit}>Add Deposit</button>
      </div>
    </Modal>
  );
}
