import { useState, useEffect } from 'react';
import Modal from '../../shared/Modal/Modal.jsx';
import Loader from '../../shared/Loader/Loader.jsx';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../redux/auth/authSlice';
import { signOut } from '../../../api/authApi';
import Toast from '../../shared/Toast/Toast'; 
import styles from './Header.module.css';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Ekran büyüyünce menüyü kapat
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

const handleLogout = async () => {
  try {
    setLogoutLoading(true);
    await signOut(); // Backend isteği
    // Başarılıysa hemen yönlendir
    dispatch(logout());
    navigate('/login');
  } catch (error) {
    // ŞARTNAME: "Hata işlenmeli ve pop-up gösterilmelidir"
    const errorMessage = error?.response?.data?.message || 'Logout failed.';
    setErrorMsg(errorMessage);

    // ŞARTNAME: "Backend yanıtından bağımsız olarak de-otorize edilmelidir"
    // Kullanıcı mesajı okusun diye kısa bir bekleme:
    setTimeout(() => {
      dispatch(logout());
      navigate('/login');
    }, 2000);
  } finally {
    setLogoutConfirm(false);
    setLogoutLoading(false);
  }
};

  const firstLetter = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <>
      {errorMsg && (
        <Toast 
          message={errorMsg} 
          onClose={() => setErrorMsg(null)} 
        />
      )}

      {logoutLoading && <Loader />}
      {logoutConfirm && (
        <Modal onClose={() => setLogoutConfirm(false)}>
          <div className={styles.confirmModal}>
            <h3 className={styles.confirmTitle}>Log out</h3>
            <p className={styles.confirmText}>Are you sure you want to log out?</p>
            <div className={styles.confirmBtns}>
              <button className={styles.confirmYes} onClick={handleLogout}>Yes</button>
              <button className={styles.confirmNo} onClick={() => setLogoutConfirm(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      <header className={styles.header}>
        <NavLink to="/recommended" className={styles.logo}>
          <svg width="24" height="17" viewBox="0 0 24 17" fill="none">
            <path d="M1 1h10v15H1zM13 1h10v15H13z" stroke="#F9F9F9" strokeWidth="1.5"/>
          </svg>
          <span className={styles.logoText}>READ JOURNEY</span>
        </NavLink>

        <nav className={styles.nav}>
          <NavLink
            to="/recommended"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/library"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            My library
          </NavLink>
        </nav>

        <div className={styles.right}>
          <div className={styles.avatar}>{firstLetter}</div>
          <span className={styles.userName}>{user?.name}</span>
          <button className={styles.logoutBtn} onClick={() => setLogoutConfirm(true)}>
            Log out
          </button>
          <button
            className={styles.burgerBtn}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
              <line x1="0" y1="1" x2="28" y2="1" stroke="#F9F9F9" strokeWidth="2" strokeLinecap="round"/>
              <line x1="0" y1="7" x2="28" y2="7" stroke="#F9F9F9" strokeWidth="2" strokeLinecap="round"/>
              <line x1="0" y1="13" x2="28" y2="13" stroke="#F9F9F9" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className={styles.overlay} onClick={() => setMenuOpen(false)}>
          <div className={styles.mobileMenu} onClick={e => e.stopPropagation()}>
            <button
              className={styles.closeBtn}
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 1L15 15M15 1L1 15" stroke="#F9F9F9" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            <nav className={styles.mobileNav}>
              <NavLink
                to="/recommended"
                className={({ isActive }) =>
                  `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                }
                onClick={() => setMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/library"
                className={({ isActive }) =>
                  `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                }
                onClick={() => setMenuOpen(false)}
              >
                My library
              </NavLink>
            </nav>

            <button className={styles.mobileLogoutBtn} onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;