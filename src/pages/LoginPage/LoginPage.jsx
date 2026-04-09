import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from 'react-redux';
import loginSchema from '../../schemas/loginSchema';
import { signIn } from '../../api/authApi';
import { setCredentials } from '../../redux/auth/authSlice';
import styles from './LoginPage.module.css';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(loginSchema), mode: 'onChange' });

  const passwordValue = watch('password', '');
  const isPasswordValid = passwordValue.length >= 7 && !errors.password;

  const onSubmit = async data => {
    try {
      setServerError('');
      const response = await signIn(data);
      dispatch(
        setCredentials({
          user: { name: response.name, email: response.email },
          token: response.token,
          refreshToken: response.refreshToken,
        })
      );
      navigate('/recommended');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.formCard}>
          <div className={styles.logo}>
            <svg width="24" height="17" viewBox="0 0 24 17" fill="none">
              <path d="M1 1h10v15H1zM13 1h10v15H13z" stroke="#F9F9F9" strokeWidth="1.5"/>
            </svg>
            <span className={styles.logoText}>READ JOURNEY</span>
          </div>

          <h1 className={styles.title}>
            Expand your mind,{' '}
            <span className={styles.titleAccent}>reading a book</span>
          </h1>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div className={styles.fieldWrapper}>
              <div className={`${styles.inputBox} ${errors.email ? styles.inputBoxError : ''}`}>
                <span className={styles.inputLabel}>Mail:</span>
                <input
                  className={styles.input}
                  placeholder="your@email.com"
                  {...register('email')}
                />
                {errors.email && (
                  <span className={styles.iconError}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#EF2323" strokeWidth="1.2"/>
                      <path d="M8 5v4M8 11v.5" stroke="#EF2323" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </span>
                )}
              </div>
              {errors.email && (
                <p className={styles.errorMsg}>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className={styles.fieldWrapper}>
              <div className={`${styles.inputBox} ${errors.password ? styles.inputBoxError : ''} ${isPasswordValid ? styles.inputBoxSuccess : ''}`}>
                <span className={styles.inputLabel}>Password:</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Yourpasswordhere"
                  {...register('password')}
                />

                {/* Göz ikonu HER ZAMAN görünsün */}
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(prev => !prev)}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>

                {/* Hata ikonu */}
                {errors.password && (
                  <span className={styles.iconError}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#EF2323" strokeWidth="1.2"/>
                      <path d="M8 5v4M8 11v.5" stroke="#EF2323" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </span>
                )}

                {/* Başarı ikonu */}
                {isPasswordValid && (
                  <span className={styles.iconSuccess}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#30B94D" strokeWidth="1.2"/>
                      <path d="M5 8l2 2 4-4" stroke="#30B94D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </div>
              
              {errors.password && (
                <p className={styles.errorMsg}>{errors.password.message}</p>
              )}
              {isPasswordValid && (
                <p className={styles.successMsg}>Password is secure</p>
              )}
            </div>

            {serverError && <p className={styles.serverError}>{serverError}</p>}

            <div className={styles.actions}>
              <button type="submit" className={styles.submitBtn}>Log In</button>
              <Link to="/register" className={styles.link}>Don't have an account?</Link>
            </div>
          </form>
        </div>

        <div className={styles.imageCard} />
      </div>
    </div>
  );
}

export default LoginPage;