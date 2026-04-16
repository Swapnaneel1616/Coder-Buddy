import React, { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

/**
 * ThemeToggle – a tiny component that lets the user switch between light and dark
 * themes. The selected theme is persisted in `localStorage` and applied to the
 * document root via a `data-theme` attribute, which can be leveraged in CSS.
 *
 * Usage:
 *   import ThemeToggle from "./components/ThemeToggle";
 *   ...
 *   <ThemeToggle />
 *
 * The component is deliberately self‑contained: it does not rely on any external
 * context or state management, making it easy to drop into any part of the UI.
 */
const ThemeToggle: React.FC = () => {
  // Initialise state from localStorage (if present) or default to "light".
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "dark" ? "dark" : "light";
  });

  // Whenever the theme changes, reflect it in the DOM and persist it.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Simple toggle handler.
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Render a button showing an appropriate icon / label.
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle light/dark theme"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "1.5rem",
        padding: 0,
      }}
    >
      {theme === "light" ? "🌞" : "🌙"}
    </button>
  );
};

export default ThemeToggle;