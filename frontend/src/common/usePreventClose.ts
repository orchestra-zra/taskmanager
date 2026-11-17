import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";

/**
 * Modern TMA Closing Confirmation Hook (Section 1.3)
 * Prompts user before closing the app when there are unsaved form changes.
 */
export function usePreventClose(shouldPrevent: boolean = true) {
  useEffect(() => {
    if (!shouldPrevent) {
      try {
        WebApp?.disableClosingConfirmation?.();
      } catch {}
      return;
    }

    try {
      WebApp?.enableClosingConfirmation?.();
    } catch {}

    return () => {
      try {
        WebApp?.disableClosingConfirmation?.();
      } catch {}
    };
  }, [shouldPrevent]);
}

export default usePreventClose;
