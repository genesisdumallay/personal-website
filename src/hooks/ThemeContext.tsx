"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getIsDarkMode,
  setIsDarkMode,
} from "../../stateContext/GlobalState.js";

type ThemeContextType = {
  isDark: boolean;
  toggleDark: () => void;
  setIsDark: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState<boolean>(getIsDarkMode());

  const toggleDark = () => {
    const v = !isDark;
    setIsDark(v);
    setIsDarkMode(v);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
