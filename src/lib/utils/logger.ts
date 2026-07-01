const isDev = __DEV__;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },

  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },

  error: (...args: unknown[]) => {
    if (isDev) console.error(...args);
  },

  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },

  apiError: (error: unknown, context: string) => {
    if (isDev) {
      console.error(`[API Error] ${context}:`, JSON.stringify({
        context,
        message: (error as any)?.message ?? 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
        url: (error as any)?.config?.url,
        method: (error as any)?.config?.method,
      }, null, 2));
    } else {
      // Skip 401 in prod — handled by the interceptor, noisy in Sentry
      if ((error as any)?.response?.status === 401) return;
      console.error(`[API Error] ${context}:`, {
        status: (error as any)?.response?.status,
        message: (error as any)?.message,
      });
    }
  },

  apiRequest: (method: string, url: string, payload?: unknown) => {
    if (isDev) {
      console.log(`[API] ${method.toUpperCase()} ${url}`, payload ?? '');
    }
  },

  apiResponse: (url: string, status: number) => {
    if (isDev) {
      console.log(`[API] ${status} ${url}`);
    }
  },
};
