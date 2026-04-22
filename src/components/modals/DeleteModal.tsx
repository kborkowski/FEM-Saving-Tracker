import Modal from './Modal';
import { useGoals, useGoalById } from '../../context/GoalsContext';

interface DeleteModalProps {
  goalId: string;
}

export default function DeleteModal({ goalId }: DeleteModalProps) {
  const { dispatch } = useGoals();
  const goal = useGoalById(goalId);

  const handleClose = () => dispatch({ type: 'CLOSE_MODAL' });

  const handleDelete = () => {
    dispatch({ type: 'DELETE_GOAL', payload: goalId });
    dispatch({ type: 'SELECT_GOAL', payload: null });
    dispatch({ type: 'CLOSE_MODAL' });
  };

  return (
    <Modal title="Delete Goal" onClose={handleClose}>
      <p className="delete-warning">
        Are you sure you want to delete <strong>{goal?.name ?? 'this goal'}</strong>? This action cannot be undone and all deposit history will be lost.
      </p>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
        <button className="btn btn-danger" onClick={handleDelete}>Delete Goal</button>
      </div>
    </Modal>
  );
}
