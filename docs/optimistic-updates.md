# Optimistic Updates with TanStack Query

An optimistic update applies a mutation's expected result to the cache
_immediately_, before the server responds, so the UI feels instant. If the
request fails, we roll the cache back to its previous state.

This template uses TanStack Query. The canonical pattern uses the mutation
lifecycle: `onMutate` → `onError` → `onSettled`, together with `QUERY_KEYS`
(from `src/lib/utils/query-keys.ts`).

## The pattern

Implement optimistic mutations inside the relevant feature's `hooks.ts`.

```ts
// src/features/todos/hooks.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import { handleApiError } from "~/lib/utils/error-handler";
import TodoService from "./api";
import type { Todo } from "./types";

export function useToggleTodo() {
  const queryClient = useQueryClient();
  const listKey = QUERY_KEYS.todos.all;

  return useMutation({
    mutationFn: TodoService.toggle,

    // 1. Apply the change to the cache before the request resolves.
    onMutate: async (toggled: Todo) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic write.
      await queryClient.cancelQueries({ queryKey: listKey });

      // Snapshot the current value for rollback.
      const previous = queryClient.getQueryData<Todo[]>(listKey);

      // Optimistically update the cache.
      queryClient.setQueryData<Todo[]>(listKey, (old) =>
        (old ?? []).map((t) =>
          t.id === toggled.id ? { ...t, done: !t.done } : t,
        ),
      );

      // Pass the snapshot to onError via context.
      return { previous };
    },

    // 2. On failure, roll back to the snapshot.
    onError: (error, _toggled, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous);
      }
      handleApiError(error);
    },

    // 3. Always refetch afterwards to sync with the server's truth.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKey });
    },
  });
}
```

## Rules of thumb

- **Always `cancelQueries` first** in `onMutate`. Otherwise an in-flight refetch
  can land after your optimistic write and clobber it.
- **Snapshot, then mutate, then return the snapshot** as context so `onError`
  can restore it. Never mutate cached objects in place — build new
  objects/arrays (`.map`, spread) so React sees a new reference.
- **`onSettled` invalidates** the affected keys so the cache re-syncs with the
  server on both success and failure.
- **Suppress the global error alert when you handle it locally.** The global
  `MutationCache.onError` in `src/providers/tanstack-query.tsx` already reports
  to Sentry; if your `onError` shows its own message and you don't want a second
  alert, set `meta: { suppressGlobalError: true }` on the mutation.
- **Single-item detail caches:** if you also render `QUERY_KEYS.todos.byId(id)`,
  snapshot and update that key too, and invalidate it in `onSettled`.

## When to use it

Reach for optimistic updates on frequent, low-risk, reversible actions where
latency is annoying: toggles, likes, reordering, add/remove from a list,
checkbox state. For high-stakes or non-idempotent actions (payments, account
changes), prefer showing a pending state and waiting for the server response.

## Reference

- [TanStack Query — Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- Query-key helpers: `src/lib/utils/query-keys.ts`
- Global error handling: `src/providers/tanstack-query.tsx`
