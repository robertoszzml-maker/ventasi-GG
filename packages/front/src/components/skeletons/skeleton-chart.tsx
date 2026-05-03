import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonChart() {
    return (
        <div className="flex flex-col space-y-6">
            <Skeleton className="h-[320px] w-full rounded-lg" /> {/* Skeleton para el gráfico */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-[250px]" /> {/* Skeleton para título */}
                <Skeleton className="h-4 w-[200px]" /> {/* Skeleton para descripción */}
            </div>
        </div>
    )


}