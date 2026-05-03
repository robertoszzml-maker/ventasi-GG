import type { Metadata } from "next"
import { Changelog } from '@/components/changelog'


export default function ChangelogPage() {
    return (
        <div className="container max-w-4xl py-10 px-4 md:py-16 md:px-0 mx-auto">
            <div className="space-y-6 mb-10">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Historial de cambios</h1>
                <p className="text-muted-foreground text-lg">
                    Un registro detallado de todas las actualizaciones, mejoras y correcciones realizadas.
                </p>
            </div>
            <Changelog />
        </div>
    )
}

