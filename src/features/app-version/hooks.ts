import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import AppVersionService from "./api";
import type { AppVersionConfig } from "./types";

export function useGetAppVersionConfig() {
  return useQuery<AppVersionConfig | null, Error>({
    queryKey: QUERY_KEYS.appVersion.config,
    queryFn: AppVersionService.getMinRequiredVersion,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour to avoid hammering the endpoint
    retry: 1,
  });
}
