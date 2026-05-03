import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonThumb() {

    return <div className="flex gap-4 p-2">
        <Skeleton className="w-20 h-20 rounded-md" />
        <Skeleton className="w-20 h-20 rounded-md" />
        <Skeleton className="w-20 h-20 rounded-md" />
    </div>
}
