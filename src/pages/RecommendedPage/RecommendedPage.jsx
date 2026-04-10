import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { getRecommendedBooks, addBookToLibrary, getMyBooks } from '../../api/booksApi';
import { setRecommended, setCurrentPage, setMyBooks } from '../../redux/books/booksSlice';
import BookCard from '../../components/shared/BookCard/BookCard';
import Modal from '../../components/shared/Modal/Modal';
import Loader from '../../components/shared/Loader/Loader';
import Dashboard from '../../components/dashboard/Dashboard';
import Toast from '../../components/shared/Toast/Toast';
import useToast from '../../hooks/useToast';

import styles from './RecommendedPage.module.css';
// İkonları merkezden alıyoruz
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '../../assets/Icons/icons';

function RecommendedPage() {
  const dispatch = useDispatch();
  const { recommended, totalPages, currentPage } = useSelector(state => state.books);
  
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({ title: '', author: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const { register, handleSubmit } = useForm();

  const getLimit = () => {
    if (window.innerWidth >= 1440) return 10;
    if (window.innerWidth >= 768) return 8;
    return 4;
  };

  const fetchBooks = async (page = 1) => {
    try {
      setIsLoading(true);
      const limit = getLimit();
      const data = await getRecommendedBooks(page, limit, filters.title, filters.author);
      dispatch(setRecommended(data));
      dispatch(setCurrentPage(page));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(1);
  }, [filters]);

  const onFilterSubmit = data => {
    setFilters({ title: data.title || '', author: data.author || '' });
  };

  const handleCardClick = book => {
    setSelectedBook(book);
    setModalOpen(true);
  };

  const myBooks = useSelector(state => state.books.myBooks);

  const handleAddToLibrary = async () => {
    const alreadyInLibrary = myBooks.some(
      book => book.title.toLowerCase().trim() === selectedBook.title.toLowerCase().trim()
    );

    if (alreadyInLibrary) {
      showToast('This book is already in your library!', 'error');
      setModalOpen(false);
      return;
    }

    try {
      await addBookToLibrary(selectedBook._id);
      const updatedBooks = await getMyBooks();
      dispatch(setMyBooks(updatedBooks));
      
      setModalOpen(false);
      showToast('Book added to library!', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add book';
      showToast(errorMessage, 'error');
      setModalOpen(false);
    }
  };

  return (
   <>
   {isLoading && <Loader />}
     <div className={styles.page} >
      <Dashboard className={styles.dashboard}>
        <div className={styles.filtersBlock}>
          <p className={styles.filtersTitle}>Filters:</p>
          <form onSubmit={handleSubmit(onFilterSubmit)} className={styles.filtersForm}>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>Book title:</span>
              <input className={styles.input} placeholder="Enter text" {...register('title')} />
            </div>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>The author:</span>
              <input className={styles.input} placeholder="Enter text" {...register('author')} />
            </div>
            <button type="submit" className={styles.applyBtn}>To apply</button>
          </form>
        </div>

        <div className={styles.workoutBlock}>
          <h3 className={styles.workoutTitle}>Start your workout</h3>
          <ol className={styles.workoutList}>
            <li className={styles.workoutItem}>
              <span className={styles.workoutNum}>1</span>
              <p className={styles.workoutText}>
                <strong>Create a personal library:</strong> add the books you intend to read to it.
              </p>
            </li>
            <li className={styles.workoutItem}>
              <span className={styles.workoutNum}>2</span>
              <p className={styles.workoutText}>
                <strong>Create your first workout:</strong> define a goal, choose a period, start training.
              </p>
            </li>
          </ol>
          <Link to="/library" className={styles.libraryLink}>
            My library
            <ArrowRightIcon />
          </Link>
        </div>

        <div className={styles.quoteBlock}>
          <span className={styles.quoteEmoji}>📚</span>
          <p className={styles.quoteText}>
            "Books are <strong>windows</strong> to the world, and reading is a journey into the unknown."
          </p>
        </div>
      </Dashboard>

      <section className={styles.booksSection}>
        <div className={styles.booksSectionHeader}>
          <h2 className={styles.booksTitle}>Recommended</h2>
          <div className={styles.pagination}>
            <button className={styles.pageBtn} onClick={() => fetchBooks(currentPage - 1)} disabled={currentPage <= 1}>
              <ChevronLeftIcon />
            </button>
            <button className={styles.pageBtn} onClick={() => fetchBooks(currentPage + 1)} disabled={currentPage >= totalPages}>
              <ChevronRightIcon />
            </button>
          </div>
        </div>

        {isLoading ? (
          <Loader />
        ) : (
          <ul className={styles.bookGrid}>
            {recommended.map(book => (
              <li key={book._id}>
                <BookCard book={book} onClick={() => handleCardClick(book)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {modalOpen && selectedBook && (
        <Modal onClose={() => setModalOpen(false)}>
          <div className={styles.modalContent}>
            <img src={selectedBook.imageUrl} alt={selectedBook.title} className={styles.modalImage} />
            <h3 className={styles.modalTitle}>{selectedBook.title}</h3>
            <p className={styles.modalAuthor}>{selectedBook.author}</p>
            <p className={styles.modalPages}>{selectedBook.totalPages} pages</p>
            <button className={styles.addBtn} onClick={handleAddToLibrary}>Add to library</button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
   </>
  
  );
}

export default RecommendedPage;