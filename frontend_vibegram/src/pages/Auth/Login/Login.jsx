// src/pages/Auth/Login/Login.jsx
import { Container, CssBaseline, Typography, Link as MUILink } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import LoginForm from '../../../components/auth/LoginForm/LoginForm';
import styles from './Login.module.css';
import loginImage from '../../../assets/images/LoginSideImage.jpg';

export default function Login() {
  const { isAuthenticated, authChecked } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [authChecked, isAuthenticated, navigate]);

  return (
    <Container component="main" maxWidth={false} className={styles.container}>
      <CssBaseline />
      <div className={styles.loginWrapper}>
        <div className={styles.imageContainer}>
          <img src={loginImage} alt="Демонстрация приложения" className={styles.previewImage} />
        </div>

        <div className={styles.formContainer}>
          <LoginForm />

          <Typography variant="body2" component="div" className={styles.signupPrompt}>
            <span className={styles.promptText}>Don't have an account?</span>
            {/* важно не делать full reload */}
            <MUILink component={RouterLink} to="/register" className={styles.signupLink} underline="none">
              Sign up
            </MUILink>
          </Typography>
        </div>
      </div>
    </Container>
  );
}
