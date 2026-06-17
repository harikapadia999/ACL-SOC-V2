import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  email: string;
  full_name: string;
  role: 'analyst' | 'client' | 'frontend_dev';
  tenant_ids: string[];
}

interface AuthState {
  token: string | null;
  user: User | null;
  activeTenant: string | null;
  setAuth: (token: string, user: User) => void;
  setActiveTenant: (tenantId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      activeTenant: null,
      setAuth: (token, user) => {
        let defaultTenant = "";
        if (user && user.tenant_ids && user.tenant_ids.length > 0) {
          defaultTenant = user.tenant_ids[0];
        } else if (user && (user as any).tenant_id) {
          defaultTenant = (user as any).tenant_id;
        }

        localStorage.setItem('auth_token', token);

        set({
          token,
          user: {
            ...user,
            tenant_ids: user.tenant_ids || [defaultTenant]
          },
          activeTenant: defaultTenant 
        });
      },
      setActiveTenant: (tenantId) => set({ activeTenant: tenantId }),
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ token: null, user: null, activeTenant: null });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem('auth_token', state.token);
        }
      }
    }
  )
);
