import {
    QueryClient,
} from '@tanstack/react-query'

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // staleTime: 60 * 1000,
                staleTime: 0,
                refetchOnWindowFocus: false,
                //gcTime: 60 * 1000, // 1 minuto de cache
                gcTime: 0, // 1 minuto de cache
                refetchInterval: false, // Deshabilita el refetch periódico
                retry: (failureCount, error: any) => {

                    if (error?.status === 403 || error?.status === 401) {
                        return false;
                    }
                    return failureCount < 3;
                }
            },

            // dehydrate: {
            //     // include pending queries in dehydration
            //     shouldDehydrateQuery: (query) =>
            //         defaultShouldDehydrateQuery(query) ||
            //         query.state.status === 'pending',
            // },
        },
    })
}
// TODO: Este codigo es para hacer prefetching en el lado del servidor y recibir en el cliente, no lo veo necesario por el momento
// let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
    return makeQueryClient()
    // if (isServer) {
    //     // Server: always make a new query client
    // } else {
    //     // Browser: make a new query client if we don't already have one
    //     // This is very important, so we don't re-make a new client if React
    //     // suspends during the initial render. This may not be needed if we
    //     // have a suspense boundary BELOW the creation of the query client
    //     if (!browserQueryClient) browserQueryClient = makeQueryClient()
    //     return browserQueryClient
    // }
}