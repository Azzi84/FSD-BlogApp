"use client";

import { Button } from "@repo/ui/button";
import { useTheme } from "./ThemeContext";

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      onClick={toggleTheme} 
      data-test-id="theme-switch"
      className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200 ease-in-out font-medium"
    >
      {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
    </Button>
  );
};

export default ThemeSwitch;
