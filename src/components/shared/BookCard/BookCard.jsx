import styles from './BookCard.module.css';

function BookCard({ book, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageWrapper}>
        <img
          src={book.imageUrl}
          alt={book.title}
          className={styles.image}
        />
      </div>
      <p className={styles.title}>{book.title}</p>
      <p className={styles.author}>{book.author}</p>
    </div>
  );
}

export default BookCard;