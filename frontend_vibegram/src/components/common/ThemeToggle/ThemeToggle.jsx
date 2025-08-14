import { useThemeMode } from '@/theme/ThemeProvider';

export default function ThemeToggle({ className }) {
  const { theme, toggle } = useThemeMode();

  return (
    <button
      type="button"
      onClick={toggle}
      className={className}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  );
}
