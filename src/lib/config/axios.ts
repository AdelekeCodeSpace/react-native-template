import axios from "axios";
import axiosRetry from "axios-retry";
import { getToken, deleteToken } from "~/lib/secure-storage";
import { router } from "expo-router";
import { logger } from "~/lib/utils/logger";
import {
  createLogId,
  debugStore,
  isDebugOverlayEnabled,
  LogEntry,
} from "~/lib/debug-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

function createAxiosInstance() {
  return axios.create({
    baseURL: BASE_URL,
    timeout: 45000,
    headers: {
      common: { Accept: "application/json" },
      post: { "Content-Type": "application/json" },
    },
  });
}

export const axiosInstance = createAxiosInstance();
export const axiosPrivate = createAxiosInstance();

async function logout() {
  await deleteToken();
  router.replace("/(auth)/login");
}

axiosPrivate.interceptors.request.use(
  async (request) => {
    const token = await getToken();
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => Promise.reject(error),
);

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    if (!originalRequest) return Promise.reject(error);

    const status = error?.response?.status;
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      error?.message ||
      "Network Error";

    logger.apiError(
      error,
      `${error?.config?.method?.toUpperCase()} ${error?.config?.url}`,
    );

    if (status === 401) {
      if (
        message === "Token is invalid or expired" ||
        message === "Token is blacklisted"
      ) {
        await logout();
      }
    }

    return Promise.reject(error);
  },
);

axiosRetry(axiosPrivate, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
  retryCondition: (error) => {
    const status = error.response?.status ?? 0;
    if (status === 401 || (status >= 400 && status < 500)) return false;
    return axiosRetry.isNetworkError(error) || (status >= 500 && status <= 599);
  },
});

axiosRetry(axiosInstance, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
  retryCondition: (error) => {
    const status = error.response?.status ?? 0;
    return axiosRetry.isNetworkError(error) || (status >= 500 && status <= 599);
  },
});

// ---------------------------------------------------------------------------
// Debug logger interceptor (dev + preview builds only)
//
// Feeds the in-app DebugOverlay. Registered last so the response handler runs
// after retry/logout interceptors and captures the final outcome the caller
// receives. The request handler runs first (axios runs request interceptors in
// reverse registration order), so it stamps the start time before any other
// mutation.
// ---------------------------------------------------------------------------

const safeParseRequestBody = (data: unknown) => {
  if (data == null) return undefined;
  if (typeof data !== "string") return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

// Header names redacted from debug logs so bearer tokens / cookies are never
// surfaced in the in-app DebugOverlay (which is enabled on preview builds too).
const REDACTED_HEADERS = new Set(["authorization", "cookie", "set-cookie"]);

const headersToRecord = (
  headers: unknown,
): Record<string, string> | undefined => {
  if (!headers || typeof headers !== "object") return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(
    headers as Record<string, unknown>,
  )) {
    if (value == null) continue;
    out[key] = REDACTED_HEADERS.has(key.toLowerCase())
      ? "[redacted]"
      : typeof value === "string"
        ? value
        : String(value);
  }
  return out;
};

const attachDebugLogger = (
  instance: ReturnType<typeof createAxiosInstance>,
  source: NonNullable<LogEntry["source"]>,
) => {
  if (!isDebugOverlayEnabled) return;

  instance.interceptors.request.use((config) => {
    (config as any)._debugStartTime = Date.now();
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      const startTime = (response.config as any)?._debugStartTime as
        number | undefined;
      const duration =
        typeof startTime === "number" ? Date.now() - startTime : undefined;

      debugStore.add({
        id: createLogId(),
        timestamp: new Date(),
        method: (response.config.method ?? "GET").toUpperCase(),
        url: response.config.url ?? "",
        baseURL: response.config.baseURL,
        status: response.status,
        requestBody: safeParseRequestBody(response.config.data),
        requestHeaders: headersToRecord(response.config.headers),
        responseBody: response.data,
        responseHeaders: headersToRecord(response.headers),
        duration,
        source,
      });

      return response;
    },
    (error) => {
      const startTime = (error?.config as any)?._debugStartTime as
        number | undefined;
      const duration =
        typeof startTime === "number" ? Date.now() - startTime : undefined;

      debugStore.add({
        id: createLogId(),
        timestamp: new Date(),
        method: (error?.config?.method ?? "GET").toUpperCase(),
        url: error?.config?.url ?? "",
        baseURL: error?.config?.baseURL,
        status: error?.response?.status,
        requestBody: safeParseRequestBody(error?.config?.data),
        requestHeaders: headersToRecord(error?.config?.headers),
        responseBody: error?.response?.data,
        responseHeaders: headersToRecord(error?.response?.headers),
        duration,
        error: error?.message,
        source,
      });

      return Promise.reject(error);
    },
  );
};

attachDebugLogger(axiosInstance, "public");
attachDebugLogger(axiosPrivate, "private");

export default axiosInstance;
