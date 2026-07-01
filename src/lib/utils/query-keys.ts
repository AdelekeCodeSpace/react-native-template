export type SearchParams = {
  [key: string]: string | number | boolean | undefined;
};

/**
 * Factory for the common query-key shapes of a REST resource.
 * Add feature-specific keys alongside these as your app grows.
 *
 * Example:
 *   const KEYS = createQueryKeys("posts");
 *   KEYS.all              // ["posts"]
 *   KEYS.table({ page })  // ["posts", { page }]
 *   KEYS.byId("123")      // ["posts", "123"]
 */
const createQueryKeys = <T extends string>(entity: T) => ({
  all: [entity] as const,
  table: (searchParams?: SearchParams) => [entity, searchParams] as const,
  byId: (id: string) => [entity, id] as const,
});

export const QUERY_KEYS = {
  users: {
    me: ["me"] as const,
    ...createQueryKeys("users"),
  },
  appVersion: {
    config: ["appVersion", "config"] as const,
  },
};
