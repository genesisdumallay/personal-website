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
const DEFAULT_THEME = true;

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDark, setIsDarkState] = useState<boolean>(DEFAULT_THEME);
  const [isHydrated, setIsHydrated] = useState(false);

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
