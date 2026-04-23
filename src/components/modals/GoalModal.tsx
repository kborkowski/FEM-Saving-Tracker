import { useState, useRef } from 'react';
import Modal from './Modal';
import { useGoals, useGoalById } from '../../context/GoalsContext';
import { generateId } from '../../utils';
import iconError from '../../assets/images/icon-error.svg';
import iconDollar from '../../assets/images/icon-dollar.svg';
import iconCalendar from '../../assets/images/icon-calendar.svg';

interface GoalModalProps {
  goalId?: string;
}

export default function GoalModal({ goalId }: GoalModalProps) {
  const { dispatch } = useGoals();
  const existing = useGoalById(goalId ?? '');
  const isEdit = !!goalId && !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [target, setTarget] = useState(existing?.target?.toString() ?? '');
  const [deadline, setDeadline] = useState(existing?.deadline ?? '');
  const [errors, setErrors] = useState<{ name?: string; target?: string }>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<HTMLInputElement>(null);

  const handleClose = () => dispatch({ type: 'CLOSE_MODAL' });

  const handleSubmit = () => {
    const newErrors: { name?: string; target?: string } = {};
    if (!name.trim()) newErrors.name = 'Goal name is required.';
    const targetNum = parseFloat(target);
    if (!target || isNaN(targetNum) || targetNum <= 0) newErrors.target = 'Target amount must be greater than 0.';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Focus first errored field so keyboard users land there, not on Close
      setTimeout(() => {
        if (newErrors.name) nameRef.current?.focus();
        else if (newErrors.target) targetRef.current?.focus();
      }, 0);
      return;
    }

    if (isEdit && existing) {
      dispatch({
        type: 'UPDATE_GOAL',
        payload: { ...existing, name: name.trim(), target: targetNum, deadline: deadline || null },
      });
    } else {
      dispatch({
        type: 'CREATE_GOAL',
        payload: {
          id: generateId(),
          name: name.trim(),
          target: targetNum,
          deadline: deadline || null,
          createdAt: new Date().toISOString(),
          deposits: [],
        },
      });
    }
    dispatch({ type: 'CLOSE_MODAL' });
  };

  return (
    <Modal title={isEdit ? 'Edit Goal' : 'Add New Goal'} onClose={handleClose}>
      <div className="form-group">
        <label className="form-label" htmlFor="goal-name">Goal Name</label>
        <input
          id="goal-name"
          ref={nameRef}
          className={`form-input${errors.name ? ' error' : ''}`}
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
          placeholder="e.g. New MacBook Pro"
        />
        {errors.name && (
          <div className="form-error">
            <img src={iconError} alt="" />
            {errors.name}
          </div>
        )}
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="goal-target">Target Amount</label>
        <div className="form-input-wrapper">
          <img src={iconDollar} className="form-input-icon" alt="" />
          <input
            id="goal-target"
            ref={targetRef}
            className={`form-input has-icon${errors.target ? ' error' : ''}`}
            type="number"
            min="0.01"
            step="0.01"
            value={target}
            onChange={e => { setTarget(e.target.value); setErrors(prev => ({ ...prev, target: undefined })); }}
            placeholder="0.00"
          />
        </div>
        {errors.target && (
          <div className="form-error">
            <img src={iconError} alt="" />
            {errors.target}
          </div>
        )}
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="goal-deadline">Deadline (optional)</label>
        <div className="form-input-wrapper">
          <img src={iconCalendar} className="form-input-icon" alt="" />
          <input
            id="goal-deadline"
            className={`form-input has-icon deadline-input${!deadline ? ' deadline-empty' : ''}`}
            type="date"
            value={deadline ?? ''}
            onChange={e => setDeadline(e.target.value)}
          />
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit}>Save Goal</button>
      </div>
    </Modal>
  );
}
