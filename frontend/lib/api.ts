import axios from "axios";
import { TOKEN_KEY } from "./auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);

    if (token) {
      if (typeof config.headers?.set === "function") {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }

  return config;
});
