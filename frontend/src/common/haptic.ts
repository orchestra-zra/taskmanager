import WebApp from "@twa-dev/sdk";

export const haptic = {
  impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    try {
      WebApp?.HapticFeedback?.impactOccurred?.(style);
    } catch {}
  },
  notification: (type: 'error' | 'success' | 'warning') => {
    try {
      WebApp?.HapticFeedback?.notificationOccurred?.(type);
    } catch {}
  },
  selection: () => {
    try {
      WebApp?.HapticFeedback?.selectionChanged?.();
    } catch {}
  },
};

export default haptic;
