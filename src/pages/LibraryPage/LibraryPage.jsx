import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getMyBooks, addCustomBook, removeBook } from '../../api/booksApi';
import { useDispatch, useSelector } from 'react-redux';
import { setMyBooks } from '../../redux/books/booksSlice';
import Modal from '../../components/shared/Modal/Modal';
import styles from './LibraryPage.module.css';

function LibraryPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const myBooks = useSelector(state => state.books.myBooks);

  const [filter, setFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [successModal, setSuccessModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookModal, setBookModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm();



 const fetchMyBooks = async () => {
  try {
    setIsLoading(true);
    const data = await getMyBooks();
    dispatch(setMyBooks(data));
  } catch (err) {
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};
  useEffect(() => {
    fetchMyBooks();
    fetchRecommended();
  }, []);

  const fetchRecommended = async () => {
    try {
      const { getRecommendedBooks } = await import('../../api/booksApi');
      const data = await getRecommendedBooks(1, 3);
      setRecommendedBooks(data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

const onAddBook = async data => {
  try {
    const isDuplicate = myBooks.some(
      book => book.title.toLowerCase().trim() === data.title.toLowerCase().trim()
    );

    if (isDuplicate) {
      alert('This book is already in your library!');
      return;
    }

    await addCustomBook({
      title: data.title,
      author: data.author,
      totalPages: Number(data.pages),
    });
    reset();
    setSuccessModal(true);
    fetchMyBooks();
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || 'Failed to add book');
  }
};

  const handleRemoveBook = async (e, bookId) => {
    e.stopPropagation();
    try {
      await removeBook(bookId);
      fetchMyBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookClick = book => {
    setSelectedBook(book);
    setBookModal(true);
  };

  const handleStartReading = () => {
    setBookModal(false);
    navigate('/reading', { state: { book: selectedBook } });
  };

  const filterOptions = [
    { value: 'all', label: 'All books' },
    { value: 'unread', label: 'Unread' },
    { value: 'inprogress', label: 'In progress' },
    { value: 'done', label: 'Done' },
  ];

  const filteredBooks = myBooks.filter(book => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !book.progress || book.progress.length === 0;
    if (filter === 'inprogress') return book.status === 'active';
    if (filter === 'done') return book.status === 'done';
    return true;
  });

  return (
    <div className={styles.page}>
      {/* ── Dashboard (Sol/Üst Panel) ── */}
      <aside className={styles.dashboard}>
        <div className={styles.addBookBlock}>
          <p className={styles.blockTitle}>Create your library:</p>
          <form onSubmit={handleSubmit(onAddBook)} className={styles.form}>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>Book title:</span>
              <input
                className={styles.input}
                placeholder="Enter text"
                {...register('title', { required: true })}
              />
            </div>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>The author:</span>
              <input
                className={styles.input}
                placeholder="Enter text"
                {...register('author', { required: true })}
              />
            </div>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>Number of pages:</span>
              <input
                className={styles.input}
                placeholder="0"
                type="number"
                {...register('pages', { required: true, min: 1 })}
              />
            </div>
            <button type="submit" className={styles.addBtn}>
              Add book
            </button>
          </form>
        </div>

        <div className={styles.recommendedBlock}>
          <p className={styles.blockTitle}>Recommended books</p>
          <div className={styles.recommendedGrid}>
            {recommendedBooks.map(book => (
              <div key={book._id} className={styles.recommendedCard}>
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className={styles.recommendedImg}
                />
                <p className={styles.recommendedTitle}>{book.title}</p>
                <p className={styles.recommendedAuthor}>{book.author}</p>
              </div>
            ))}
          </div>
          <Link to="/recommended" className={styles.homeLink}>
            Home
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
        
        {/* Quote Block (Tasarımda varsa eklenebilir, yoksa kalabilir) */}
      </aside>

      {/* ── Library Section ── */}
      <section className={styles.librarySection}>
        <div className={styles.libraryHeader}>
          <h2 className={styles.libraryTitle}>My library</h2>

          <div className={styles.filterWrapper}>
            <button
              className={styles.filterBtn}
              onClick={() => setFilterOpen(p => !p)}
            >
              {filterOptions.find(o => o.value === filter)?.label}
              <svg
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                style={{ transform: filterOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {filterOpen && (
              <div className={styles.filterDropdown}>
                {filterOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={`${styles.filterOption} ${filter === opt.value ? styles.filterOptionActive : ''}`}
                    onClick={() => { setFilter(opt.value); setFilterOpen(false); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : filteredBooks.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>
            <p className={styles.emptyText}>
              To start training, add{' '}
              <Link to="/recommended" className={styles.emptyLink}>some of your books</Link>
              {' '}or from the recommended ones
            </p>
          </div>
        ) : (
          <ul className={styles.bookGrid}>
            {filteredBooks.map(book => (
              /* styles.bookItem sınıfı CSS'deki calc hesaplamaları için eklendi */
              <li key={book._id} className={styles.bookItem}>
                <div className={styles.bookCard} onClick={() => handleBookClick(book)}>
                  <div className={styles.imageWrapper}>
                    <img src={book.imageUrl} alt={book.title} className={styles.bookImage} />
                  </div>
                  <div className={styles.bottomInfo}>
  <div className={styles.bookMeta}>
    <p className={styles.bookTitle}>{book.title}</p>
    <p className={styles.bookAuthor}>{book.author}</p>
  </div>
  <button
    className={styles.deleteBtn}
    onClick={e => handleRemoveBook(e, book._id)}
    aria-label="Delete book"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M6 4V2h4v2M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" stroke="#EF2323" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
</div>
                  
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Modallar ── */}
      {successModal && (
        <Modal onClose={() => setSuccessModal(false)}>
          <div className={styles.successModal}>
            <span className={styles.successEmoji}>👍</span>
            <h3 className={styles.successTitle}>Good job</h3>
            <p className={styles.successText}>
              Your book is now in <strong>the library!</strong> The joy knows no bounds and now you can start your training
            </p>
          </div>
        </Modal>
      )}

      {bookModal && selectedBook && (
        <Modal onClose={() => setBookModal(false)}>
          {/* Modal içeriği CSS'deki .bookModalContent ve .modalImage sınıflarıyla uyumlu */}
          <div className={styles.bookModalContent}>
            <img
              src={selectedBook.imageUrl}
              alt={selectedBook.title}
              className={styles.modalImage}
            />
            <h3 className={styles.modalTitle}>{selectedBook.title}</h3>
            <p className={styles.modalAuthor}>{selectedBook.author}</p>
            <p className={styles.modalPages}>{selectedBook.totalPages} pages</p>
            <button className={styles.startBtn} onClick={handleStartReading}>
              Start reading
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default LibraryPage;