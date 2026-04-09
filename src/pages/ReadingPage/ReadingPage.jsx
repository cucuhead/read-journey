import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { startReading, stopReading, deleteReadingSession } from '../../api/booksApi';
import axiosInstance from '../../api/axiosInstance';
import Dashboard from '../../components/dashboard/Dashboard';
import Modal from '../../components/shared/Modal/Modal';
import styles from './ReadingPage.module.css';

const pageSchema = Yup.object({
  page: Yup.number()
    .typeError('Enter a valid page number')
    .integer('Must be a whole number')
    .min(1, 'Must be at least 1')
    .required('Page number is required'),
});

function ReadingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const book = location.state?.book;

  const [isReading, setIsReading] = useState(false);
  const [finishedModal, setFinishedModal] = useState(false);
  const [activeTab, setActiveTab] = useState('diary');
  const [progress, setProgress] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(pageSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (!book) navigate('/library');
    else fetchBookProgress();
  }, [book, navigate]);

  const fetchBookProgress = async () => {
    try {
      const { data } = await axiosInstance.get(`/books/${book._id}`);
      const completedProgress = (data.progress || []).filter(p => p.status === 'inactive');
      setProgress(completedProgress);
      const hasActive = (data.progress || []).some(p => p.status === 'active');
      setIsReading(hasActive);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async data => {
    try {
      if (!isReading) {
        await startReading(book._id, Number(data.page));
        setIsReading(true);
        reset();
      } else {
        await stopReading(book._id, Number(data.page));
        setIsReading(false);
        reset();
        await fetchBookProgress();
        if (Number(data.page) >= book.totalPages) {
          setFinishedModal(true);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDeleteReading = async (readingId) => {
    try {
      await deleteReadingSession(book._id, readingId);
      await fetchBookProgress();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const calcMinutes = (start, finish) => {
    const diff = new Date(finish) - new Date(start);
    return Math.round(diff / 60000);
  };

  const calcPercent = (startPage, finishPage) => {
    return ((finishPage - startPage) / book.totalPages * 100).toFixed(2);
  };

  if (!book) return null;

  return (
    <div className={styles.page}>
      {/* ── Dashboard ── */}
      <Dashboard className={styles.dashboard}>
        {/* AddReading formu */}
        <div className={styles.addReadingBlock}>
          <p className={styles.blockLabel}>{isReading ? 'Stop page:' : 'Start page:'}</p>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={`${styles.inputBox} ${errors.page ? styles.inputBoxError : ''}`}>
              <span className={styles.inputLabel}>Page number:</span>
              <input
                className={styles.input}
                type="number"
                placeholder="0"
                {...register('page')}
              />
            </div>
            {errors.page && <p className={styles.errorMsg}>{errors.page.message}</p>}
            <button type="submit" className={styles.actionBtn}>
              {isReading ? 'To stop' : 'To start'}
            </button>
          </form>
        </div>

        {/* Diary / Statistics tabs */}
        {progress.length > 0 ? (
          <div className={styles.detailsBlock}>
            {/* Tab header */}
            <div className={styles.tabHeader}>
              <h3 className={styles.tabTitle}>
                {activeTab === 'diary' ? 'Diary' : 'Statistics'}
              </h3>
              <div className={styles.tabBtns}>
                <button
                  className={`${styles.tabBtn} ${activeTab === 'diary' ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab('diary')}
                  title="Diary"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </button>
                <button
                  className={`${styles.tabBtn} ${activeTab === 'statistics' ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab('statistics')}
                  title="Statistics"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 21H3M21 21V8l-6-5-6 5v13M9 21v-6h6v6"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Diary */}
            {activeTab === 'diary' && (
  <div className={styles.diaryList}>
    {progress.map((item, idx) => (
      <div key={idx} className={styles.diaryItem}>
        <div className={styles.diaryDateRow}>
          <div className={styles.diaryCheckbox} />
          <span className={styles.diaryDate}>{formatDate(item.finishReading)}</span>
          <span className={styles.diaryPages}>{item.finishPage - item.startPage} pages</span>
        </div>
        <div className={styles.diaryStats}>
          <div className={styles.diaryStat}>
            <p className={styles.diaryPercent}>{calcPercent(item.startPage, item.finishPage)}%</p>
            <p className={styles.diaryMinutes}>{calcMinutes(item.startReading, item.finishReading)} minutes</p>
          </div>
          <div className={styles.diarySpeedRow}>
            <div className={styles.diarySpeedBar}>
              <div
                className={styles.diarySpeedFill}
                style={{ width: `${Math.min(item.speed / 2, 100)}%` }}
              />
            </div>
            <p className={styles.diarySpeed}>{item.speed} pages<br/>per hour</p>
            <button
              className={styles.diaryDeleteBtn}
              onClick={() => handleDeleteReading(item._id)}
              aria-label="Delete"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M6 4V2h4v2M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" stroke="#EF2323" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

            {/* Statistics */}
            {activeTab === 'statistics' && (
              <div className={styles.statistics}>
                <p className={styles.statsQuote}>
                  Each page, each chapter is a new round of knowledge, a new step towards understanding. By rewriting statistics, we create our own reading history.
                </p>
                <div className={styles.statsCircle}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#262626" strokeWidth="10"/>
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none"
                      stroke="#30B94D"
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress.reduce((acc, p) => acc + (p.finishPage - p.startPage), 0) / book.totalPages)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                    <text x="60" y="65" textAnchor="middle" fill="#F9F9F9" fontSize="18" fontWeight="700">
                      {Math.round(progress.reduce((acc, p) => acc + (p.finishPage - p.startPage), 0) / book.totalPages * 100)}%
                    </text>
                  </svg>
                </div>
                <div className={styles.statsInfo}>
                  <span className={styles.statsGreenDot} />
                  <p className={styles.statsText}>
                    {Math.round(progress.reduce((acc, p) => acc + (p.finishPage - p.startPage), 0) / book.totalPages * 100)}%
                  </p>
                  <p className={styles.statsSubtext}>
                    {progress.reduce((acc, p) => acc + (p.finishPage - p.startPage), 0)} pages read
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.progressBlock}>
            <h3 className={styles.progressTitle}>Progress</h3>
            <p className={styles.progressDesc}>
              Here you will see when and how much you read.
              To record, click on the red button above.
            </p>
            <div className={styles.progressEmpty}>
              <div className={styles.starCircle}>⭐</div>
            </div>
          </div>
        )}
      </Dashboard>

      {/* ── MyBook ── */}
      <section className={styles.myBookSection}>
        <h2 className={styles.sectionTitle}>My reading</h2>
        <div className={styles.bookContent}>
          <div className={styles.bookCover}>
            <img src={book.imageUrl} alt={book.title} className={styles.bookImage} />
          </div>
          <h3 className={styles.bookTitle}>{book.title}</h3>
          <p className={styles.bookAuthor}>{book.author}</p>
        </div>
        <button
          className={styles.readingBtn}
          onClick={handleSubmit(onSubmit)}
          aria-label={isReading ? 'Stop reading' : 'Start reading'}
        >
          {isReading ? (
            <span className={styles.stopIcon} />
          ) : (
            <span className={styles.startIcon} />
          )}
        </button>
      </section>

      {/* ── Kitap bitti modal ── */}
      {finishedModal && (
        <Modal onClose={() => setFinishedModal(false)}>
          <div className={styles.finishedModal}>
            <span className={styles.finishedEmoji}>📚</span>
            <h3 className={styles.finishedTitle}>The book is read</h3>
            <p className={styles.finishedText}>
              It was an <strong>exciting journey</strong>, where each page revealed new horizons, and the characters became inseparable friends.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ReadingPage;