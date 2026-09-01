import axios from "axios";

export const getAccessToken = () => {
  return localStorage.getItem("access");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refresh");
};

export const setAccessToken = (token) => {
  localStorage.setItem("access", token);
};

export const setRefreshToken = (token) => {
  localStorage.setItem("refresh", token);
};

export const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

export const setTokens = (access, refresh) => {
  setAccessToken(access);
  setRefreshToken(refresh);
};

export const refreshAccessToken = async () => {
  const refresh = getRefreshToken();

  if (!refresh) {
    throw new Error("Nincs refresh token.");
  }

  const response = await axios.post(
    "http://127.0.0.1:8000/api/accounts/refresh/",
    {
      refresh,
    }
  );

  setAccessToken(response.data.access);

  return response.data.access;
};