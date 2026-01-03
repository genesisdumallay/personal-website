"use client";
import React from "react";
import FloatingPoints from "./FloatingPoints";
import { useTheme } from "@/hooks/ThemeContext";

export default function AppBackground() {
  const { isDark } = useTheme();
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <FloatingPoints isDark={isDark} />
    </div>
  );
}
