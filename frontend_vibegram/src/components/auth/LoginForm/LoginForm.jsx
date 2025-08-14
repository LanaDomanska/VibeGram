import { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Divider,
  InputAdornment,
  IconButton,
  Typography,
  Link as MUILink,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import styles from './LoginForm.module.css';
import logoImage from '@/assets/images/VibeGramLogo.png';
import { useAuth } from '@/contexts/AuthContext'; 

export default function LoginForm() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login({ usernameOrEmail, password }); 
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.imageContainer}>
        <img src={logoImage} alt="VibeGram logo" className={styles.logoImage} />
      </div>

      <TextField
        fullWidth
        label="Username or email"
        variant="outlined"
        margin="normal"
        value={usernameOrEmail}
        onChange={(e) => setUsernameOrEmail(e.target.value)}
        required
        autoComplete="username email"
      />

      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        variant="outlined"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((v) => !v)}
                edge="end"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      <Button
        fullWidth
        type="submit"
        variant="contained"
        color="primary"
        className={styles.submitButton}
      >
        Log in
      </Button>

      <Divider className={styles.divider}>
        <Typography variant="body2" className={styles.dividerText}>
          OR
        </Typography>
      </Divider>

      <MUILink
        component={RouterLink}
        to="/reset-password"
        variant="body2"
        color="primary"
        underline="none"
        className={styles.forgotLink}
      >
        Forgot password?
      </MUILink>
    </Box>
  );
}
