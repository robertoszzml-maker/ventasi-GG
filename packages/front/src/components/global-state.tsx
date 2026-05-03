'use client'
import { useAppStore } from '@/hooks/useStore'

export const GlobalState = () => {
    const { count, countPersist } = useAppStore()
    return (
        <div className="footer">
            <p>Contador: {count}</p>
            <p>Contador persistente: {countPersist}</p>
        </div>
    );
};
