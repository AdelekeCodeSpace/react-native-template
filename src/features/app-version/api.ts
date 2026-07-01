import axiosInstance from "~/lib/config/axios";
import type { AppVersionConfig } from "./types";

class AppVersionService {
  /**
   * Fetch the minimum required app version from the backend.
   * Uses the public (unauthenticated) axios instance — this check runs
   * before the user logs in.
   * Fails open (returns null) so a missing / erroring endpoint never
   * blocks the app.
   */
  static getMinRequiredVersion = async (): Promise<AppVersionConfig | null> => {
    try {
      const { data } = await axiosInstance.get<AppVersionConfig>("/get-app-version");
      return data ?? null;
    } catch (error: any) {
      // 404 = endpoint not wired up yet; anything else = network / server error.
      // Either way, fail open so the app is never blocked by this check.
      return null;
    }
  };
}

export default AppVersionService;
