import { useEffect } from 'react';
import styles from './Toast.module.css';

function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <p className={styles.message}>{message}</p>
      <button className={styles.closeBtn} onClick={onClose}>✕</button>
    </div>
  );
}

export default Toast;