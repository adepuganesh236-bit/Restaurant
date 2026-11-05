import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://restaurant-backend-4phd.onrender.com/api/",
  timeout: 30000,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isServerUnavailable = (err) =>
  !err.response || [502, 503, 504].includes(err.response.status);

const HEALTH_URL = `${API.defaults.baseURL}foods/`;

// Returns "ok" when the server answered (any status that is not a gateway
// failure counts), "cold" when it looks asleep. The API root returns 401
// without auth, so probe a public endpoint instead.
const probeOnce = async (timeout) => {
  try {
    await axios.get(HEALTH_URL, { timeout });
    return "ok";
  } catch (err) {
    return isServerUnavailable(err) ? "cold" : "ok";
  }
};

export const wakeBackend = async () => {
  try {
    await axios.get(HEALTH_URL, { timeout: 90000 });
    return true;
  } catch (err) {
    return !isServerUnavailable(err);
  }
};

// Returns "ok" | "timeout". Callers use "timeout" to tell the user the server
// genuinely never woke, instead of assuming a cold start on every submit.
export const ensureBackendAwake = async () => {
  if ((await probeOnce(10000)) === "ok") return "ok";
  for (let i = 0; i < 20; i++) {
    await sleep(6000);
    if ((await probeOnce(10000)) === "ok") return "ok";
  }
  return "timeout";
};

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Remember which token this request actually used, so a 401 can tell
      // whether another request already refreshed it in the meantime.
      config._sentAccessToken = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const MAX_RETRIES = 4;
const RETRY_DELAY_MS = 4000;

const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

const redirectToLogin = () => {
  clearTokens();
  if (!window.location.pathname.startsWith("/login")) {
    window.location.assign("/login");
  }
};

// SimpleJWT answers 401 with code "token_not_valid" when the bearer token is
// expired or is the wrong type (a refresh token used as an access token).
const isTokenInvalid = (error) =>
  error.response?.status === 401 &&
  (error.response?.data?.code === "token_not_valid" ||
    error.response?.data?.detail?.includes("token"));

let refreshInFlight = null;

// Single shared refresh so parallel 401s trigger one call, not one each.
const refreshAccessToken = () => {
  if (!refreshInFlight) {
    refreshInFlight = axios
      .post(`${API.defaults.baseURL}token/refresh/`, {
        refresh: localStorage.getItem("refresh"),
      })
      .then((res) => {
        const access = res.data?.access;
        if (!access) throw new Error("refresh response had no access token");
        localStorage.setItem("access", access);
        if (res.data?.refresh) {
          localStorage.setItem("refresh", res.data.refresh);
        }
        return access;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (
      config &&
      isTokenInvalid(error) &&
      !config._isRefreshRequest &&
      !config._hasRetriedAfterRefresh
    ) {
      config._hasRetriedAfterRefresh = true;
      try {
        // A sibling request may have already rotated the token while this one
        // was in flight. Reuse it instead of spending another refresh call.
        const current = localStorage.getItem("access");
        const access =
          current && current !== config._sentAccessToken
            ? current
            : await refreshAccessToken();
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${access}`;
        return API.request(config);
      } catch {
        redirectToLogin();
        return Promise.reject(error);
      }
    }

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
