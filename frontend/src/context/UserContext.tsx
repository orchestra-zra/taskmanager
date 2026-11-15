import { createContext, PropsWithChildren, useContext, useEffect, useReducer } from "react";
import NotTelegram from "../components/mini/NotTelegram";
import i18n from "../i18n";
import WebApp from "@twa-dev/sdk";
import { useNavigate } from "react-router-dom";
import axiosClient from "../common/axiosClient";

interface UserState {
  user: {
    telegram_id: number;
    first_name: string;
    username: string;
    lang: string;
  };
  location: string;
  isTelegramWebApp: boolean;
}

interface UserContextType {
  user: UserState['user'];
  updateUserState: (state: Partial<UserState>) => void;
  location: string;
  isWebApp: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
const testMode: string = import.meta.env.VITE_TEST_MODE;

const initialState: UserState = {
  user: {
    telegram_id: 0,
    first_name: "no user",
    username: "no username",
    lang: "en",
  },
  location: "",
  isTelegramWebApp: true,
};

function UserProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const [state, setState] = useReducer(
    (state: UserState, setState: Partial<UserState>) => ({
    ...state,
    ...setState,
  }), initialState);
  
  const initer = async () => {
    const isProdMode = testMode === 'false' ? true : false;
    const userStateUpdate = (user: {
      id: number;
      firstName: string;
      username: string;
      languageCode: string;
    }) => {
      const userData = {
        telegram_id: user.id,
        first_name: user.firstName,
        username: user.username,
        lang: user.languageCode,
      };
      i18n.changeLanguage(user.languageCode);
      setState({ user: userData });
    };
    if (isProdMode) {
      const dataUnsafe = WebApp.initDataUnsafe;
      const isTelegramWebApp = !!(dataUnsafe?.user);
      setState({ isTelegramWebApp });
  
      if (dataUnsafe?.start_param) {
        const [, path, id] = dataUnsafe.start_param.match(/^(.*?)_(\d+)$/) || [];
        if (path && id) navigate(`/${path}/${id}`);
      }
  
      try {
        const response = await axiosClient.post('/auth', {});
        if (response?.data?.user) {
          userStateUpdate(response.data.user);
        } else {
          setState({ isTelegramWebApp: false });
        }
      } catch (error) {
        console.error("Telegram auth failed:", error);
        setState({ isTelegramWebApp: false });
      }
    }else{
      const testUserData = {
        id: 1448242182,
        firstName: "Munir",
        username: "SMART_DIE",
        languageCode: "en",
        location: "home"
      };
      userStateUpdate(testUserData);
    }
  }

  useEffect(() => {
    initer();
    // Mount-only by design: this is the one-shot auth bootstrap (Telegram
    // WebApp initData parse, start_param redirect, POST /auth). `initer` is
    // recreated on every render (and closes over `navigate`, which changes on
    // each navigation), so adding it to deps would re-run the whole login flow
    // on every render/navigation instead of once per app lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state.isTelegramWebApp && testMode === 'false') {
    return <NotTelegram />;
  }

  

  const contextValue: UserContextType = {
    ...state,
    isWebApp: state.isTelegramWebApp,
    updateUserState: setState,
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}

const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }

  return context;
};

// UserContext and the useUserContext hook are intentionally co-located with
// UserProvider (single small context module for this app); splitting them into
// separate files would add indirection without benefit.
// eslint-disable-next-line react-refresh/only-export-components
export { UserProvider, UserContext, useUserContext };