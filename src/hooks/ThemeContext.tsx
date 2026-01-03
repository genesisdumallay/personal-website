"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

type ThemeContextType = {
  isDark: boolean;
  toggleDark: () => void;
  setIsDark: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "theme_preference";
const DEFAULT_THEME = true; // dark mode by default

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always start with default to prevent hydration mismatch
  const [isDark, setIsDarkState] = useState<boolean>(DEFAULT_THEME);
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync with localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored !== null) {
      setIsDarkState(stored === "dark");
    }
    setIsHydrated(true);
  }, []);

  const setIsDark = useCallback((v: boolean) => {
    setIsDarkState(v);
    localStorage.setItem(THEME_STORAGE_KEY, v ? "dark" : "light");
  }, []);

  const toggleDark = useCallback(() => {
    setIsDarkState((prev) => {
      const next = !prev;
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
  }, [isDark]);

  const contextValue = useMemo(
    () => ({ isDark, toggleDark, setIsDark }),
    [isDark, toggleDark, setIsDark]
  );

  // Prevent flash by not rendering until hydrated, or use CSS to handle it
  return (
    <ThemeContext.Provider value={contextValue}>
      <div style={{ visibility: isHydrated ? "visible" : "hidden" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
