import { useEffect } from 'react';
import styles from './Modal.module.css';

function Modal({ onClose, children }) {
  useEffect(() => {
    const handleEsc = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M1 1L15 15M15 1L1 15" stroke="#F9F9F9" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;