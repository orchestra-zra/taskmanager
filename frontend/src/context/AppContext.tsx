import WebApp from "@twa-dev/sdk";
import { createContext, PropsWithChildren, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AppContext = createContext({});

function AppProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const initializeWebApp = async () => {
      WebApp.SettingsButton.show();
      WebApp.SettingsButton.onClick(() => navigate("/settings"));
      WebApp.expand();
      WebApp.MainButton.hide();
      WebApp.disableVerticalSwipes();
      function handleBack() {
        window.history.back();
      }

      const BackButton = WebApp.BackButton;
      BackButton.onClick(handleBack);
    };

    initializeWebApp();
    // Mount-only by design: this registers the Telegram SettingsButton and
    // BackButton onClick handlers exactly once. `navigate` identity changes on
    // every navigation (react-router v6), and adding it here would re-register
    // the handlers on each route change — Telegram would then fire every
    // registered callback per press (multiple history.back() calls / redirects).
    // The WebApp init/expand calls must also run only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (location.pathname === "/onboarding") {
      root.style.setProperty(
        "background-image",
        "linear-gradient(to top, #5856D6 0%, #007AFF 100%)",
      );
    } else {
      root.style.removeProperty("background-image");
      root.style.removeProperty("background-color");
    }
  }, [location.pathname]);
  const contextValue = {};
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within a AppContext");
  }

  return context;
};

// AppContext and the useAppContext hook are intentionally co-located with
// AppProvider (single small context module for this app); splitting them into
// separate files would add indirection without benefit.
// eslint-disable-next-line react-refresh/only-export-components
export { AppProvider, AppContext, useAppContext };
