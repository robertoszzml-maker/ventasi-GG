import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ConfigState {
    accessibilityMode: boolean;
    viewMode: 'table' | 'grid';
    toggleAccessibilityMode: () => void;
    setViewMode: (mode: 'table' | 'grid') => void;
}

export const useConfigStore = create<ConfigState>()(
    persist(
        (set, get) => ({
            accessibilityMode: false,
            viewMode: 'table' as const,
            toggleAccessibilityMode: () => set({ accessibilityMode: !get().accessibilityMode }),
            setViewMode: (mode: 'table' | 'grid') => set({ viewMode: mode }),
        }),
        {
            name: 'config-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                accessibilityMode: state.accessibilityMode,
                viewMode: state.viewMode
            }),
        }
    )
);
