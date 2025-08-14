import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Container,
  Link as MuiLink
} from "@mui/material";
import { useSearchParams, useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../../../services/api";
import styles from "./ResetPassword.module.css";

const ResetPasswordConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token.");
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return setError("Password is required");

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/auth/reset-password", { token, password });
      setSuccess(res.data?.message || "Password updated successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs" className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.paperMain}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Set a new password
        </Typography>

        <TextField
          fullWidth
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          variant="outlined"
          size="small"
        />

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography color="primary" variant="body2" sx={{ mt: 1 }}>
            {success}
          </Typography>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={isSubmitting || !token}
          sx={{ mt: 2 }}
        >
          Set password
        </Button>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Back to{" "}
          <MuiLink component={RouterLink} to="/login" underline="hover">
            Log in
          </MuiLink>
        </Typography>
      </form>
    </Container>
  );
};

export default ResetPasswordConfirm;
