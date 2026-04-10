import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from 'react-redux';
import loginSchema from '../../schemas/loginSchema';
import { signIn } from '../../api/authApi';
import { setCredentials } from '../../redux/auth/authSlice';
import Toast from '../../components/shared/Toast/Toast';
import useToast from '../../hooks/useToast';
import styles from './LoginPage.module.css';
// İkonları merkezden alıyoruz
import { EyeOpenIcon, EyeClosedIcon, ErrorIcon, SuccessIcon } from '../../assets/Icons/icons';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(loginSchema), mode: 'onChange' });

  const passwordValue = watch('password', '');
  const isPasswordValid = passwordValue.length >= 7 && !errors.password;

  const onSubmit = async data => {
    console.log('submit called', data);
    try {
      const response = await signIn(data);
      console.log('success', response);
      dispatch(
        setCredentials({
          user: { name: response.name, email: response.email },
          token: response.token,
          refreshToken: response.refreshToken,
        })
      );
      navigate('/recommended');
    } catch (error) {
      console.log('error', error);
      showToast(error.response?.data?.message || 'Login failed');
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
            <div className={styles.fieldWrapper}>
              <div className={`${styles.inputBox} ${errors.email ? styles.inputBoxError : ''}`}>
                <span className={styles.inputLabel}>Mail:</span>
                <input className={styles.input} placeholder="your@email.com" {...register('email')} />
                {errors.email && (
                  <span className={styles.iconError}>
                    <ErrorIcon />
                  </span>
                )}
              </div>
              {errors.email && <p className={styles.errorMsg}>{errors.email.message}</p>}
            </div>

            <div className={styles.fieldWrapper}>
              <div className={`${styles.inputBox} ${errors.password ? styles.inputBoxError : ''} ${isPasswordValid ? styles.inputBoxSuccess : ''}`}>
                <span className={styles.inputLabel}>Password:</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Yourpasswordhere"
                  {...register('password')}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(prev => !prev)}>
                  {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
                {errors.password && (
                  <span className={styles.iconError}>
                    <ErrorIcon />
                  </span>
                )}
                {isPasswordValid && (
                  <span className={styles.iconSuccess}>
                    <SuccessIcon />
                  </span>
                )}
              </div>
              {errors.password && <p className={styles.errorMsg}>{errors.password.message}</p>}
              {isPasswordValid && <p className={styles.successMsg}>Password is secure</p>}
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.submitBtn}>Log In</button>
              <Link to="/register" className={styles.link}>Don't have an account?</Link>
            </div>
          </form>
        </div>
        <div className={styles.imageCard} />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}

export default LoginPage;