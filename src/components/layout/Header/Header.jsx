import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../redux/auth/authSlice';
import { signOut } from '../../../api/authApi';
import styles from './Header.module.css';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);

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
      await signOut();
    } catch {
      // backend hatası olsa bile client'ı temizle
    } finally {
      dispatch(logout());
      navigate('/login');
      setMenuOpen(false);
    }
  };

  const firstLetter = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <>
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
          <button className={styles.logoutBtn} onClick={handleLogout}>
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