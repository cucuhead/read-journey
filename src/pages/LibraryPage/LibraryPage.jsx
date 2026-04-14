import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { getMyBooks, addCustomBook, removeBook } from '../../api/booksApi';
import { useDispatch, useSelector } from 'react-redux';
import { setMyBooks } from '../../redux/books/booksSlice';
import Modal from '../../components/shared/Modal/Modal';
import Dashboard from '../../components/dashboard/Dashboard';
import { BookIcon } from '../../assets/Icons/icons';
import Loader from '../../components/shared/Loader/Loader';
import Toast from '../../components/shared/Toast/Toast';
import useToast from '../../hooks/useToast';
import styles from './LibraryPage.module.css';
import { ArrowRightIcon, ChevronDownIcon, TrashIcon } from '../../assets/Icons/icons';

const addBookSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  author: Yup.string().required('Author is required'),
  pages: Yup.number()
    .typeError('Must be a valid number')
    .min(1, 'Must be at least 1 page')
    .required('Number of pages is required'),
});

const BookPlaceholder = () => (
  <div className={styles.placeholderWrapper}>
    <BookIcon />
  </div>
);

function LibraryPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const myBooks = useSelector(state => state.books.myBooks);
  const { toast, showToast, hideToast } = useToast();

  const [filter, setFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [successModal, setSuccessModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookModal, setBookModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(addBookSchema),
    mode: 'onChange',
  });

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
      book =>
        book.title.toLowerCase().trim() === data.title.toLowerCase().trim() &&
        book.author.toLowerCase().trim() === data.author.toLowerCase().trim()
    );

    if (isDuplicate) {
      showToast('This book is already in your library!', 'error');
      return;
    }

    const { getRecommendedBooks, addBookToLibrary } = await import('../../api/booksApi');
    const searchResult = await getRecommendedBooks(1, 10, data.title, data.author);
    const matchedBook = (searchResult.results || []).find(
      book =>
        book.title.toLowerCase().trim() === data.title.toLowerCase().trim() &&
        book.author.toLowerCase().trim() === data.author.toLowerCase().trim()
    );

    if (matchedBook) {
      await addBookToLibrary(matchedBook._id);
    } else {
      await addCustomBook({
        title: data.title,
        author: data.author,
        totalPages: Number(data.pages),
      });
    }

    reset();
    setSuccessModal(true);
    fetchMyBooks();
  } catch (err) {
    showToast(err.response?.data?.message || 'Failed to add book', 'error');
  }
};

  const handleRemoveBook = async (e, bookId) => {
    e.stopPropagation();
    try {
      await removeBook(bookId);
      fetchMyBooks();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove book', 'error');
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
    
   
    if (filter === 'unread') return book.status === 'unread';
    

    if (filter === 'inprogress') return book.status === 'in-progress';
    
  
    if (filter === 'done') return book.status === 'done';
    
    return true;
  });

  return (
    <>
      {isLoading && <Loader />}
      <div className={styles.page}>
        <Dashboard className={styles.dashboard}>
          <div className={styles.addBookBlock}>
            <p className={styles.blockTitle}>Create your library:</p>
            <form onSubmit={handleSubmit(onAddBook)} className={styles.form}>
              <div className={styles.fieldWrapper}>
                <div className={`${styles.inputBox} ${errors.title ? styles.inputBoxError : ''}`}>
                  <span className={styles.inputLabel}>Book title:</span>
                  <input className={styles.input} placeholder="Enter text" {...register('title')} />
                </div>
                {errors.title && <p className={styles.errorMsg}>{errors.title.message}</p>}
              </div>

              <div className={styles.fieldWrapper}>
                <div className={`${styles.inputBox} ${errors.author ? styles.inputBoxError : ''}`}>
                  <span className={styles.inputLabel}>The author:</span>
                  <input className={styles.input} placeholder="Enter text" {...register('author')} />
                </div>
                {errors.author && <p className={styles.errorMsg}>{errors.author.message}</p>}
              </div>

              <div className={styles.fieldWrapper}>
                <div className={`${styles.inputBox} ${errors.pages ? styles.inputBoxError : ''}`}>
                  <span className={styles.inputLabel}>Number of pages:</span>
                  <input className={styles.input} placeholder="0" type="number" {...register('pages')} />
                </div>
                {errors.pages && <p className={styles.errorMsg}>{errors.pages.message}</p>}
              </div>

              <button type="submit" className={styles.addBtn}>Add book</button>
            </form>
          </div>

          <div className={styles.recommendedBlock}>
            <p className={styles.blockTitle}>Recommended books</p>
            <div className={styles.recommendedGrid}>
              {recommendedBooks.map(book => (
                <div key={book._id} className={styles.recommendedCard}>
                  <img src={book.imageUrl} alt={book.title} className={styles.recommendedImg} />
                  <p className={styles.recommendedTitle}>{book.title}</p>
                  <p className={styles.recommendedAuthor}>{book.author}</p>
                </div>
              ))}
            </div>
            <Link to="/recommended" className={styles.homeLink}>
              Home
              <ArrowRightIcon />
            </Link>
          </div>
        </Dashboard>

        <section className={styles.librarySection}>
          <div className={styles.libraryHeader}>
            <h2 className={styles.libraryTitle}>My library</h2>
            <div className={styles.filterWrapper}>
              <button className={styles.filterBtn} onClick={() => setFilterOpen(p => !p)}>
                {filterOptions.find(o => o.value === filter)?.label}
                <div style={{ transform: filterOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', display: 'flex' }}>
                  <ChevronDownIcon />
                </div>
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

          {filteredBooks.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <BookIcon />
              </div>
              <p className={styles.emptyText}>
                To start training, add{' '}
                <Link to="/recommended" className={styles.emptyLink}>some of your books</Link>
                {' '}or from the recommended ones
              </p>
            </div>
          ) : (
            <ul className={styles.bookGrid}>
              {filteredBooks.map(book => (
                <li key={book._id} className={styles.bookItem}>
                  <div className={styles.bookCard} onClick={() => handleBookClick(book)}>
          <div className={styles.imageWrapper}>
  {book.imageUrl ? (
    <img
      src={book.imageUrl}
      alt={book.title}
      className={styles.bookImage}
    />
  ) : (
    <BookPlaceholder />
  )}
</div>
                    <div className={styles.bottomInfo}>
                      <div className={styles.bookMeta}>
                        <p className={styles.bookTitle}>{book.title}</p>
                        <p className={styles.bookAuthor}>{book.author}</p>
                      </div>
                      <button className={styles.deleteBtn} onClick={e => handleRemoveBook(e, book._id)} aria-label="Delete book">
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

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
            <div className={styles.bookModalContent}>
              {selectedBook.imageUrl ? (
                <img src={selectedBook.imageUrl} alt={selectedBook.title} className={styles.modalImage} />
              ) : (
                <div className={styles.modalPlaceholder}>
                  <BookPlaceholder />
                </div>
              )}
              <h3 className={styles.modalTitle}>{selectedBook.title}</h3>
              <p className={styles.modalAuthor}>{selectedBook.author}</p>
              <p className={styles.modalPages}>{selectedBook.totalPages} pages</p>
              <button className={styles.startBtn} onClick={handleStartReading}>Start reading</button>
            </div>
          </Modal>
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      </div>
    </>
  );
}

export default LibraryPage;