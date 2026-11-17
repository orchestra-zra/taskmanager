import WebApp from "@twa-dev/sdk";

/**
 * Lightweight, safe facade around Telegram WebApp.
 * Provides safe access with fallbacks when running outside Telegram (e.g. desktop browser, vitest).
 */
export const telegram = {
  /** Check if running inside Telegram Mini App */
  get isInsideTelegram(): boolean {
    return typeof window !== "undefined" && Boolean((window as unknown as { Telegram?: { WebApp?: { initData?: string } } })?.Telegram?.WebApp?.initData);
  },

  /** Underlying WebApp instance */
  get webApp() {
    return WebApp;
  },

  /** Telegram launch initData */
  get initData(): string {
    try {
      return WebApp.initData || "";
    } catch {
      return "";
    }
  },

  /** Current Telegram User from initDataUnsafe */
  get user() {
    try {
      return WebApp.initDataUnsafe?.user;
    } catch {
      return undefined;
    }
  },

  /** Expand Mini App to full viewport */
  expand() {
    try {
      WebApp.expand();
    } catch {}
  },

  /** Lock vertical pull-down-to-close gesture */
  disableVerticalSwipes() {
    try {
      WebApp.disableVerticalSwipes();
    } catch {}
  },

  /** Enable native confirmation dialog when user tries to close app with unsaved changes */
  enableClosingConfirmation() {
    try {
      WebApp.enableClosingConfirmation();
    } catch {}
  },

  /** Disable confirmation dialog */
  disableClosingConfirmation() {
    try {
      WebApp.disableClosingConfirmation();
    } catch {}
  },

  /** Safe Haptic Feedback */
  haptic: {
    impact(style: "light" | "medium" | "heavy" | "rigid" | "soft" = "light") {
      try {
        WebApp.HapticFeedback?.impactOccurred?.(style);
      } catch {}
    },
    notification(type: "error" | "success" | "warning") {
      try {
        WebApp.HapticFeedback?.notificationOccurred?.(type);
      } catch {}
    },
    selection() {
      try {
        WebApp.HapticFeedback?.selectionChanged?.();
      } catch {}
    },
  },

  /** Set Telegram top header bar color */
  setHeaderColor(color: `#${string}` | "bg_color" | "secondary_bg_color") {
    try {
      WebApp.setHeaderColor(color);
    } catch {}
  },

  /** Set Telegram bottom background color */
  setBackgroundColor(color: `#${string}` | "bg_color" | "secondary_bg_color") {
    try {
      WebApp.setBackgroundColor(color);
    } catch {}
  },
};

export default telegram;
