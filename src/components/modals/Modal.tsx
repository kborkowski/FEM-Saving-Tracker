import { useEffect, useRef } from 'react';
import { iconCross } from '../../assets/images';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface ModalProps {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}

export default function Modal({ children, title, onClose }: ModalProps) {
  const titleId = 'modal-title';
  const dialogRef = useRef<HTMLDivElement>(null);

  // Scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Initial focus — runs once on mount only
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusables = () => Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
    // Skip the close button (first in DOM) — focus the first content element instead
    const first = focusables().find(el => !el.classList.contains('modal-close')) ?? focusables()[0];
    first?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus trap + Escape — re-subscribes only when onClose changes
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusables = () => Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const els = focusables();
      if (els.length === 0) return;

      const first = els[0];
      const last = els[els.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
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
        <div className="modal-divider" />
        {children}
      </div>
    </div>
  );
}
