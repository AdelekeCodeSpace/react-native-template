import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
  MutationCache,
} from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { type ReactNode } from 'react';
import * as Sentry from '@sentry/react-native';
import { handleApiError } from '~/lib/utils/error-handler';

// Extend TanStack Query meta to support the suppressGlobalError flag.
// Set meta: { suppressGlobalError: true } on any query/mutation that handles
// its own errors locally to prevent the global handler from double-alerting.
declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: { suppressGlobalError?: boolean };
    mutationMeta: { suppressGlobalError?: boolean };
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.suppressGlobalError) return;

      // 401/403/404 are handled by the axios interceptor or are non-critical
      if (isAxiosError(error) && [401, 403, 404].includes(error.response?.status ?? 0)) {
        return;
      }

      if (!__DEV__) {
        Sentry.captureException(error, {
          tags: {
            type: 'query_error',
            queryKey: JSON.stringify(query.queryKey),
          },
        });
      }

      handleApiError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.suppressGlobalError) return;

      if (!__DEV__) {
        Sentry.captureException(error, {
          tags: { type: 'mutation_error' },
        });
      }
      // Mutations call handleApiError in their own onError hooks —
      // no global alert here to avoid double notifications.
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
