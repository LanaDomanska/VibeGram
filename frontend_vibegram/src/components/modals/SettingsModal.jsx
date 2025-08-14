// src/components/modals/SettingsModal.jsx
import React from "react";
import styles from "./SettingsModal.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeMode } from "@/components/common/ThemeToggle/ThemeProvider"; // ← добавили

export default function SettingsModal({ isOpen, onClose, onToggleTheme }) {
  const { logout } = useAuth();
  const { theme, toggle } = useThemeMode(); // ← текущая тема и переключатель

  if (!isOpen) return null;

  // единая точка переключения: сначала пробуем prop, иначе контекст
  const handleToggleTheme = () => {
    if (typeof onToggleTheme === "function") onToggleTheme();
    else toggle();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
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

        {/* Кнопка темы */}
        <button onClick={handleToggleTheme}>
          {theme === "dark" ? "Light theme" : "Dark theme"}
        </button>
         <button onClick={onClose}>Delete account</button>
        

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
