import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserView } from "@/shared/types";
import { UserRole } from "@/shared/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserView | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string, user: UserView) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isAccountant: () => boolean;
  isAtLeastAccountant: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setTokens: (access, refresh, user) =>
        set({
          accessToken: access,
          refreshToken: refresh,
          user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
      isAdmin: () => get().user?.role === UserRole.ADMINISTRATOR,
      isAccountant: () => get().user?.role === UserRole.ACCOUNTANT,
      isAtLeastAccountant: () =>
        (get().user?.role ?? -1) >= UserRole.ACCOUNTANT,
    }),
    { name: "auth-storage" },
  ),
);
