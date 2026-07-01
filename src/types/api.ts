export interface ApiErrorResponse {
  error?: string;
  detail?: string;
  message?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PaginatedResponse<T, DataKey extends string = 'data'> = Record<
  DataKey,
  T[]
> & {
  meta: PaginationMeta;
};
