import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import './i18n'; 
import Application from "./Application.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { AppProvider } from "./context/AppContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
WebApp.ready();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <UserProvider>
          <AppProvider>
            <Application/>
          </AppProvider>
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>,
);
