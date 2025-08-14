import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Link as MUILink,
  Stack,
  Container,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import styles from "../Register/Register.module.css";
import logoImage from "../../../assets/images/VibeGramLogo.png";
import api from "../../../api/axios";
import { useAuth } from "../../../contexts/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);



  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (form.password !== form.confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  try {
    setSubmitting(true);

    await api.post("/auth/register", {
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
    });

    await login({
      usernameOrEmail: form.username.trim(),
      password: form.password,
    });

    localStorage.setItem("firstLogin", "true");

    navigate("/edit-profile", { replace: true });

  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Registration failed";
    setError(msg);
    setSubmitting(false);
  }
};

  return (
    <Container maxWidth="xs" className={styles.container}>
      <Box component="form" onSubmit={handleSubmit} className={styles.paperMain}>
        <div className={styles.imageContainer}>
          <img src={logoImage} alt="logo" className={styles.logoImage} />
        </div>

        <Typography variant="body1" sx={{ mt: 1, mb: 3 }} color="text.secondary">
          Sign up to see photos and videos from your friends.
        </Typography>

        <Stack spacing={2}>
          <TextField
            name="email"
            label="Email"
            value={form.email}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="email"
          />
          <TextField
            name="username"
            label="Username"
            value={form.username}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="username"
          />
          <TextField
            name="password"
            type="password"
            label="Password"
            value={form.password}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="new-password"
          />
          <TextField
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="new-password"
          />
        </Stack>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          disabled={submitting}
        >
          {submitting ? "Signing up…" : "Sign up"}
        </Button>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Have an account?{" "}
          <MUILink component={RouterLink} to="/login" underline="hover">
            Log in
          </MUILink>
        </Typography>
      </Box>
    </Container>
  );
};

export default Register;
