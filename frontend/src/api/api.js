import axios from "axios";

import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from "./tokenService";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    console.log("🔥 Response interceptor meghívva");
    console.log(error.response?.status);
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    if (
      error.response.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (originalRequest.url === "/accounts/refresh/") {
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization =
            `Bearer ${token}`;

          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log("➡️ Refresh kérés indul");

      const response = await axios.post(
        "http://127.0.0.1:8000/api/accounts/refresh/",
        {
          refresh: getRefreshToken(),
        }
      );

  console.log("✅ Refresh sikeres", response.data);

      const newAccessToken = response.data.access;

      setAccessToken(newAccessToken);

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);

    } catch (refreshError) {
      console.error("❌ Refresh hiba:", refreshError);

      processQueue(refreshError, null);

      clearTokens();

      window.location.href = "/login";

      return Promise.reject(refreshError);

    } finally {

      isRefreshing = false;

    }
  }
);

export default api;