import axios from "axios";

import { clearAuthSession, getUsableAccessToken } from "@/auth/session";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getUsableAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof error.config?.headers?.Authorization === "string"
    ) {
      const sentAuthorization = error.config.headers.Authorization;
      const currentToken = localStorage.getItem("accessToken");

      if (
        sentAuthorization.startsWith("Bearer ") &&
        sentAuthorization.slice("Bearer ".length) === currentToken
      ) {
        clearAuthSession();
      }
    }

    return Promise.reject(error);
  },
);
