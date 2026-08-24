import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://restaurant-backend-4phd.onrender.com/api/",
  timeout: 30000,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isServerUnavailable = (err) =>
  !err.response || [502, 503, 504].includes(err.response.status);

export const wakeBackend = async () => {
  try {
    await axios.get(API.defaults.baseURL, { timeout: 90000 });
    return true;
  } catch (err) {
    return !isServerUnavailable(err);
  }
};

export const ensureBackendAwake = async () => {
  try {
    await axios.get(API.defaults.baseURL, { timeout: 10000 });
    return true;
  } catch (err) {
    if (!isServerUnavailable(err)) return true;
    for (let i = 0; i < 9; i++) {
      await sleep(6000);
      try {
        await axios.get(API.defaults.baseURL, { timeout: 10000 });
        return true;
      } catch (pollErr) {
        if (!isServerUnavailable(pollErr)) return true;
      }
    }
    return false;
  }
};

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    config.headers["Bypass-Tunnel-Reminder"] = "true";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const MAX_RETRIES = 4;
const RETRY_DELAY_MS = 4000;

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (
      config &&
      isServerUnavailable(error) &&
      !(config._retryCount >= MAX_RETRIES)
    ) {
      config._retryCount = (config._retryCount || 0) + 1;
      await sleep(RETRY_DELAY_MS);
      return API.request(config);
    }
    return Promise.reject(error);
  }
);

export default API;
