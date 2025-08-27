'use client';

import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTimeAndSetMode = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Dark mode from 6 PM (18:00) to 6 AM (06:00)
      const shouldBeDark = hour >= 18 || hour < 6;
      setIsDarkMode(shouldBeDark);
    };

    // Set initial mode
    checkTimeAndSetMode();

    // Check every minute for time changes
    const interval = setInterval(checkTimeAndSetMode, 60000);

    return () => clearInterval(interval);
  }, []);

  // Manual toggle function (for future use if needed)
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return { isDarkMode, toggleDarkMode };
}