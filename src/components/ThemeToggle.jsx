import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const THEME_STORAGE_KEY = 'solana_wallet_theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    setTheme(savedTheme);
    document.body.className = `theme-${savedTheme}`;
  }, []);

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    document.body.className = `theme-${newTheme}`;
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-xl glass hover:bg-white/10 transition-all duration-300 ease-in-out"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun size={20} style={{ color: 'var(--text-secondary)' }} />
      ) : (
        <Moon size={20} style={{ color: 'var(--text-secondary)' }} />
      )}
    </motion.button>
  );
}

