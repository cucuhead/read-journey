import styles from './BookCard.module.css';

function BookCard({ book, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageWrapper}>
        <img
          src={book.imageUrl}
          alt={book.title}
          className={styles.image}
           onError={e => {
    e.target.style.display = 'none';
    e.target.parentElement.style.display = 'flex';
    e.target.parentElement.style.alignItems = 'center';
    e.target.parentElement.style.justifyContent = 'center';
    e.target.parentElement.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(249,249,249,0.2)" strokeWidth="1"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
  }}
        />
      </div>
      <p className={styles.title}>{book.title}</p>
      <p className={styles.author}>{book.author}</p>
    </div>
  );
}

export default BookCard;