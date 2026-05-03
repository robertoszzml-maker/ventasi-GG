
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonTable() {
    return (
        <div className="animate-pulse">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">
                            <Skeleton className="h-4 w-full rounded" />
                        </TableHead>
                        <TableHead>
                            <Skeleton className="h-4 w-full rounded" />
                        </TableHead>
                        <TableHead>
                            <Skeleton className="h-4 w-full rounded" />
                        </TableHead>
                        <TableHead className="text-right">
                            <Skeleton className="h-4 w-full rounded" />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <Skeleton className="h-4 w-full rounded" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-4 w-full rounded" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-4 w-full rounded" />
                        </TableCell>
                        <TableCell className="text-right">
                            <Skeleton className="h-4 w-full rounded" />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Skeleton className="h-4 w-full rounded" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-4 w-full rounded" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-4 w-full rounded" />
                        </TableCell>
                        <TableCell className="text-right">
                            <Skeleton className="h-4 w-full rounded" />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Skeleton className="h-4 w-full rounded" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-4 w-full rounded" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-4 w-full rounded" />
                        </TableCell>
                        <TableCell className="text-right">
                            <Skeleton className="h-4 w-full rounded" />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}