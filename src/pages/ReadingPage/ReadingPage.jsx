import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { startReading, stopReading, deleteReadingSession } from '../../api/booksApi';
import axiosInstance from '../../api/axiosInstance';
import Dashboard from '../../components/dashboard/Dashboard';
import Modal from '../../components/shared/Modal/Modal';
import Toast from '../../components/shared/Toast/Toast';
import useToast from '../../hooks/useToast';
import styles from './ReadingPage.module.css';

// İkon isimlerini senin Icons.jsx dosyandaki export isimlerine göre kontrol etmelisin
// Eğer isimler farklıysa (örn: HourglassIcon, BookIcon) buradan değiştirebilirsin
// ReadingPage.jsx dosyasının üstünde
import { IconChart as DiaryIcon, IconHourglass as StatisticsIcon, TrashIcon } from '../../assets/Icons/icons';

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
  const { toast, showToast, hideToast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(pageSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (!book) {
      navigate('/library');
    } else {
      fetchBookProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      showToast(err.response?.data?.message || 'Something went wrong', 'error');
    }
  };

  const handleDeleteReading = async (readingId) => {
    try {
      await deleteReadingSession(book._id, readingId);
      await fetchBookProgress();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete', 'error');
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
      <Dashboard className={styles.dashboard}>
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

        {progress.length > 0 ? (
          <div className={styles.detailsBlock}>
            <div className={styles.tabHeader}>
              <h3 className={styles.tabTitle}>
                {activeTab === 'diary' ? 'Diary' : 'Statistics'}
              </h3>
              <div className={styles.tabBtns}>
                {/* Diary Butonu */}
                <button
                  className={`${styles.tabBtn} ${activeTab === 'diary' ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab('diary')}
                  title="Diary"
                >
                  <DiaryIcon />
                </button>
                {/* Statistics (Kum Saati) Butonu */}
                <button
                  className={`${styles.tabBtn} ${activeTab === 'statistics' ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab('statistics')}
                  title="Statistics"
                >
                  <StatisticsIcon />
                </button>
              </div>
            </div>

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
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'statistics' && (
              <div className={styles.statistics}>
                <p className={styles.statsQuote}>
                  Each page, each chapter is a new round of knowledge, a new step towards understanding. By rewriting statistics, we create our own reading history.
                </p>
                <div className={styles.statsCircle}>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="65" fill="none" stroke="#262626" strokeWidth="12"/>
                    <circle
                      cx="80" cy="80" r="65"
                      fill="none"
                      stroke="#30B94D"
                      strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 65}`}
                      strokeDashoffset={`${2 * Math.PI * 65 * (1 - Math.min(progress.reduce((acc, p) => acc + (p.finishPage - p.startPage), 0) / book.totalPages, 1))}`}
                      strokeLinecap="round"
                      transform="rotate(-90 80 80)"
                    />
                    <text x="80" y="86" textAnchor="middle" fill="#F9F9F9" fontSize="24" fontWeight="700">
                      {Math.round(Math.min(progress.reduce((acc, p) => acc + (p.finishPage - p.startPage), 0) / book.totalPages * 100, 100))}%
                    </text>
                  </svg>
                </div>
                <div className={styles.statsInfo}>
                  <span className={styles.statsGreenDot} />
                  <p className={styles.statsText}>
                    {Math.round(Math.min(progress.reduce((acc, p) => acc + (p.finishPage - p.startPage), 0) / book.totalPages * 100, 100))}%
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}

export default ReadingPage;