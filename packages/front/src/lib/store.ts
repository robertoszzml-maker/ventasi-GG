import { NEXT_STORE_GLOBAL } from '@/config';
import { Menu, Permission, User } from '@/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
interface AppState {
    count: number
    countPersist: number
    increment: () => void
    incrementCountPersist: () => void
    sessionToken?: string
    setSessionToken: (token?: string) => void
    user?: User | null
    setUser: (user?: User) => void,
    permissions: Permission[]
    setPermissions: (permissions: Permission[]) => void
    menu?: Menu
    setMenu: (menu?: Menu) => void
}
export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            count: 0,
            increment: () => set((state) => ({ count: state.count + 1 })),
            countPersist: 0,
            incrementCountPersist: () => set({ countPersist: get().countPersist + 1 }),
            sessionToken: undefined,
            setSessionToken: (sessionToken?: string) => set({ sessionToken }),
            user: null,
            setUser: (user?: User) => set({ user }),
            permissions: [],
            setPermissions: (permissions: Permission[]) => set({ permissions }),
            menu: undefined,
            setMenu: (menu?: Menu) => set({ menu }),
        }),
        {
            name: NEXT_STORE_GLOBAL,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ countPersist: state.countPersist, sessionToken: state.sessionToken }),
        },
    ),
)
