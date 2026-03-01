"use client";

import { useEffect } from "react";
import { loadSettings } from "../lib/storage";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const settings = loadSettings();
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, []);

  // Listen for theme changes from settings page
  useEffect(() => {
    const handler = () => {
      const settings = loadSettings();
      document.documentElement.setAttribute("data-theme", settings.theme);
    };
    window.addEventListener("theme-changed", handler);
    return () => window.removeEventListener("theme-changed", handler);
  }, []);

  return <>{children}</>;
}
