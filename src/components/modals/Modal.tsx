import { useEffect, useRef } from 'react';
import { iconCross } from '../../assets/images';

interface ModalProps {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}

export default function Modal({ children, title, onClose }: ModalProps) {
  const titleId = 'modal-title';
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
      >
        <div className="modal-header">
          <h2 className="modal-title" id={titleId}>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <img src={iconCross} alt="" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
