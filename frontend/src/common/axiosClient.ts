import axios from "axios";
import { BACKEND_URL, BACKEND_URL_LOCAL } from "../constants/backend";
import { retrieveLaunchParams } from '@telegram-apps/sdk';

const testMode: string = import.meta.env.VITE_TEST_MODE;
const baseURL = testMode === "true" && BACKEND_URL_LOCAL ? BACKEND_URL_LOCAL : BACKEND_URL;

const getAuthorizationHeader = (): string => {
  if (testMode === "true") {
    return "tma TEST_MODE";
  }
  try {
    const directInitData = (window as unknown as { Telegram?: { WebApp?: { initData?: string } } })?.Telegram?.WebApp?.initData;
    if (directInitData) {
      return `tma ${directInitData}`;
    }
    return `tma ${retrieveLaunchParams().initDataRaw ?? ""}`;
  } catch {
    return "tma ";
  }
};

const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": getAuthorizationHeader()
  }
});

axiosClient.interceptors.request.use((config) => {
  config.headers.Authorization = getAuthorizationHeader();
  return config;
});

export default axiosClient;