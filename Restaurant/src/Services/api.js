import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    console.log("Token:",token);

    config.headers["Bypass-Tunnel-Reminder"] = "true";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Headers:", config.headers);

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;