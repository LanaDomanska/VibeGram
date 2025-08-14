import React from "react";
import styles from "./SettingsModal.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeMode } from "@/components/common/ThemeToggle/ThemeProvider";

export default function SettingsModal({ isOpen, onClose, onToggleTheme }) {
  const { logout } = useAuth();
  const { theme, toggle } = useThemeMode();

  if (!isOpen) return null;

  const handleToggleTheme = () => {
    if (typeof onToggleTheme === "function") onToggleTheme();
    else toggle();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.deleteBtn}
          onClick={() => {
            logout();
            onClose();
          }}
        >
          Log out
        </button>

        <button onClick={() => alert("Здесь будет форма смены пароля")}>
          Change password
        </button>

        <button onClick={handleToggleTheme}>
          {theme === "dark" ? "Light theme" : "Dark theme"}
        </button>
        <button onClick={onClose}>Delete account</button>

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
