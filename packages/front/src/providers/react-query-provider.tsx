'use client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getQueryClient } from '@/lib/query-client'
// import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import type * as React from 'react'

// TODO: No es necesario el prefetching
export default function Providers({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            {/* <HydrationBoundary state={dehydrate(queryClient)}> */}
            {children}
            <ReactQueryDevtools />
            {/* </HydrationBoundary> */}
        </QueryClientProvider>
    )
}