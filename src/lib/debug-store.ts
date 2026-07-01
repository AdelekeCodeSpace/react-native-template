/**
 * Debug Log Store
 *
 * Lightweight in-memory ring buffer of network activity, used by the
 * in-app DebugOverlay to surface request/response details on dev and
 * preview builds. Production builds bypass this entirely via
 * `isDebugOverlayEnabled`, so logs are never recorded.
 *
 * The store intentionally exposes a vanilla `subscribe` API so the
 * axios interceptors (non-React) can write to it, while a thin
 * `useSyncExternalStore` hook lets the overlay react to updates
 * without forcing every screen in the app to re-render.
 */

import Constants from "expo-constants";
import { useSyncExternalStore } from "react";

export type LogEntry = {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  baseURL?: string;
  status?: number;
  requestBody?: unknown;
  requestHeaders?: Record<string, string>;
  responseBody?: unknown;
  responseHeaders?: Record<string, string>;
  /** Round-trip duration in milliseconds. */
  duration?: number;
  /** Populated when the request rejects (network error, timeout, etc.). */
  error?: string;
  /** Identifies which axios instance produced the entry. */
  source?: "public" | "private";
};

type Listener = () => void;

const MAX_LOGS = 200;

class DebugStore {
  private logs: LogEntry[] = [];
  private listeners = new Set<Listener>();

  add(entry: LogEntry) {
    this.logs = [entry, ...this.logs].slice(0, MAX_LOGS);
    this.emit();
  }

  getAll(): LogEntry[] {
    return this.logs;
  }

  clear() {
    if (this.logs.length === 0) return;
    this.logs = [];
    this.emit();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const debugStore = new DebugStore();

/**
 * React hook that returns the current logs and re-subscribes the
 * caller whenever the store mutates.
 */
export const useDebugLogs = (): LogEntry[] => {
  return useSyncExternalStore(
    (cb) => debugStore.subscribe(cb),
    () => debugStore.getAll(),
    () => debugStore.getAll(),
  );
};

/**
 * Generate a short, unique-enough id for a log entry. Collisions are
 * irrelevant — entries roll out of the ring buffer quickly.
 */
export const createLogId = (): string =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

const variant = Constants.expoConfig?.extra?.appVariant;

/**
 * The overlay is mounted (and the axios interceptor records logs) on:
 *   - dev client builds (`__DEV__`)
 *   - EAS `development` builds (APP_VARIANT=development)
 *   - EAS `preview` builds (APP_VARIANT=preview)
 *
 * Production builds skip everything, so there is zero runtime cost
 * and the FAB is never rendered for end users.
 */
export const isDebugOverlayEnabled: boolean =
  !!__DEV__ || variant === "development" || variant === "preview";
