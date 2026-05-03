import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'

type DownloadButtonProps = {
    onClick: () => void
}
export const DownloadButton = ({ onClick }: DownloadButtonProps) => {
    return <>
        <Button
            size={'sm'}
            className="ml-auto  h-8 lg:flex "
            onClick={onClick}
        >
            <Download />
        </Button>
    </>
}