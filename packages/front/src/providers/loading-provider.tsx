"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { Spinner } from "@/components/ui/spinner"

interface LoadingContextType {
    showLoading: () => void
    hideLoading: () => void
    isLoading: boolean
}

export const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

interface LoadingProviderProps {
    children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
    const [isLoading, setIsLoading] = useState(false)

    const showLoading = () => {
        setIsLoading(true)
    }

    const hideLoading = () => {
        setIsLoading(false)
    }

    return (
        <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading }}>
            {children}
            {isLoading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-background/90 to-muted/80 backdrop-blur-sm animate-fade-in">
                    <Spinner size="lg" />
                    <p className="mt-4 text-2xl  animate-pulse">Cargando...</p>
                </div>
            )}

        </LoadingContext.Provider>
    )
}


