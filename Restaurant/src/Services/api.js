import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/",
  timeout: 90000,
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

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (config && !error.response && !config._retried) {
      config._retried = true;
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return API.request(config);
    }
    return Promise.reject(error);
  }
);

export default API;