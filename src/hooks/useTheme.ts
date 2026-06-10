"use client";

import { useEffect, useState } from "react";
import { ALL_THEMES } from "@/constants/themes";

export type ThemeMode = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "theme";
const THEME_MODE_STORAGE_KEY = "theme-mode";
const THEME_VALUES = ALL_THEMES.map((theme) => theme.value);

export const useTheme = () => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [selectedTheme, setSelectedThemeState] = useState<string>("caffeine");

  useEffect(() => {
    // Check localStorage on mount
    const storedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (storedMode === "light" || storedMode === "dark" || storedMode === "system") {
      setThemeModeState(storedMode as ThemeMode);
    }

    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme && (THEME_VALUES as string[]).includes(storedTheme)) {
      setSelectedThemeState(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark", ...THEME_VALUES);
    
    if (selectedTheme && selectedTheme !== "default" && selectedTheme !== "system") {
      root.classList.add(selectedTheme);
    }

    if (themeMode === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(themeMode);
  }, [selectedTheme, themeMode]);

  const setThemeMode = (newMode: ThemeMode) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, newMode);
    }
    setThemeModeState(newMode);
  };

  const setSelectedTheme = (newTheme: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
    setSelectedThemeState(newTheme);
  };

  const toggleTheme = () => {
    let nextThemeMode: ThemeMode = "dark";
    if (themeMode === "dark") nextThemeMode = "light";
    else if (themeMode === "light") nextThemeMode = "system";

    setThemeMode(nextThemeMode);
  };

  return {
    theme: themeMode,
    setTheme: setThemeMode,
    toggleTheme,
    themeMode,
    selectedTheme,
    setSelectedTheme,
  };
};
