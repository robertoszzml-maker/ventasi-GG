import React from 'react'
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    Dialog,
    DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
interface DeleteDialogProps {
    onClose?: () => void
    onDelete: () => void
    isLoading?: boolean
    open: boolean
    message?: string // Prop opcional para el mensaje


}

const DeleteDialog = ({ onClose, onDelete, isLoading, open, message }: DeleteDialogProps) => {
    return (
        <Dialog open={open} >
            <DialogContent className="max-w-[30%]" >

                {isLoading && <p>Cargando...</p>}
                {
                    !isLoading &&

                    <>
                        <DialogHeader>
                            <DialogTitle>Atención</DialogTitle>
                            <DialogDescription>
                                {message || '¿Está seguro que desea eliminar este registro?'}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="sm:justify-start">
                            <Button type="button" variant="default" onClick={onDelete}>
                                Aceptar
                            </Button>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                        </DialogFooter>
                    </>
                }
            </DialogContent>
        </Dialog>

    )
}

export { DeleteDialog }
