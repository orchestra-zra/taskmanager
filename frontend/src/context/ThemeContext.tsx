import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setAppHeaderColor: (colorType?: "card" | "app" | "gradient" | string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("planjet_theme") as ThemeMode | null;
    return saved || "system";
  });

  const getSystemIsDark = () => {
    try {
      if (WebApp?.colorScheme) {
        return WebApp.colorScheme === "dark";
      }
    } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  };

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("planjet_theme") as ThemeMode | null;
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return getSystemIsDark();
  });

  const applyTheme = (dark: boolean) => {
    setIsDark(dark);
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    try {
      const headerColor = dark ? "#1C1C1E" : "#FFFFFF";
      const bgColor = dark ? "#000000" : "#F2F2F7";
      WebApp?.setHeaderColor?.(headerColor);
      WebApp?.setBackgroundColor?.(bgColor);
    } catch {}
  };

  useEffect(() => {
    const effectiveDark = theme === "system" ? getSystemIsDark() : theme === "dark";
    applyTheme(effectiveDark);

    const onTelegramThemeChange = () => {
      if (theme === "system") {
        applyTheme(getSystemIsDark());
      }
    };

    try {
      WebApp?.onEvent?.("themeChanged", onTelegramThemeChange);
    } catch {}

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === "system" && !WebApp?.colorScheme) {
        applyTheme(e.matches);
      }
    };
    mediaQuery?.addEventListener?.("change", onSystemThemeChange);

    return () => {
      try {
        WebApp?.offEvent?.("themeChanged", onTelegramThemeChange);
      } catch {}
      mediaQuery?.removeEventListener?.("change", onSystemThemeChange);
    };
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem("planjet_theme", newTheme);
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const setAppHeaderColor = (colorType: "card" | "app" | "gradient" | string = "card") => {
    try {
      if (colorType === "card") {
        WebApp?.setHeaderColor?.(isDark ? "#1C1C1E" : "#FFFFFF");
      } else if (colorType === "app") {
        WebApp?.setHeaderColor?.(isDark ? "#000000" : "#F2F2F7");
      } else {
        WebApp?.setHeaderColor?.(colorType as `#${string}`);
      }
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme, setAppHeaderColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
