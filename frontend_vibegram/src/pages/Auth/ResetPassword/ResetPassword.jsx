import React, { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  Box,
  Container,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import styles from "../ResetPassword/ResetPassword.module.css";
import Troublelogging from "../../../assets/Troublelogging.svg";
import api from "@/api/axios"; // <— единый инстанс

const ResetPassword = () => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!input.trim()) {
      setError("Please enter your email, phone or username");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/reset-request", {
        email: input.trim(),
      });
      setSuccess(res.data?.message || "Reset link sent successfully.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs" className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.paperMain}>
        <Box className={styles.imageContainer}>
          <img
            className={styles.logoImage}
            src={Troublelogging}
            alt="Reset icon"
            style={{ maxWidth: 70 }}
          />
        </Box>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Trouble logging in?
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Enter your email, phone, or username and we’ll send you a link to get
          back into your account.
        </Typography>

        <TextField
          fullWidth
          placeholder="Email, phone or username"
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
          disabled={isSubmitting || !input.trim()}
          sx={{ mt: 2 }}
        >
          Send login link
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

export default ResetPassword;
