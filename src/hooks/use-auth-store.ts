import { create } from "zustand";

/**
 * Shape of the session returned by your auth endpoint.
 * Adjust these fields to match your backend's login response.
 */
export interface Token {
  access: string;
}

interface AuthState {
  token: Token | null;
  setAuthToken: (token: Token) => void;
  clearAuthToken: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,

  setAuthToken: (token: Token) => set({ token }),

  clearAuthToken: () => set({ token: null }),

  isAuthenticated: () => get().token !== null,
}));
