import { Badge } from "./ui/badge"

const bgColors: Record<string, string> = {
    'LIBRE': 'bg-green-500',
    'ARRENDADO': 'bg-indigo-500',
    'EN_NEGOCIACION': 'bg-pink-500',
    'FINALIZADO': 'bg-red-600'
}

export const EstadoBadge = ({ estado }: { estado: string }) => {
    return (
        <Badge className={bgColors[estado] ?? 'bg-gray-400'} variant={'default'}>
            {estado.replace(/_/g, ' ')}
        </Badge>
    )
}
