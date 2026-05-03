import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type EditableInputProps = {
    field: any;
    label?: string;
    onChange?: () => void;
    className: string;
    disabled?: boolean;
    isInteger?: boolean
};
export const EditableInput = ({ field, label, onChange, className, disabled, isInteger }: EditableInputProps) => {
    const [open, setOpen] = useState(false);
    const [editValue, setEditValue] = useState<string>("");

    // Formatea el número como precio español (1.234,56)
    const formatPrice = (value: number) => {
        const isWhole = Number.isInteger(value);
        return new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: isWhole ? 0 : 2,
            maximumFractionDigits: 2
        }).format(value || 0);
    };

    // Convierte el string editado a número (acepta 1.234,56 o 1234,56)
    const parsePriceInput = (value: string) => {
        const cleaned = value.replace(/\./g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    };

    // Cuando se abre el diálogo, carga el valor formateado para edición
    useEffect(() => {
        if (open) {
            setEditValue(formatPrice(field.value));
        }
    }, [open, field.value]);

    const handleSave = () => {
        const numValue = parsePriceInput(editValue);
        field.onChange(numValue);
        if (onChange) {
            onChange()
        }
        setOpen(false);
    };

    // Maneja cambios manteniendo el formato durante la edición
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // Permite solo números, comas y puntos
        value = value.replace(/[^0-9,.]/g, '');

        // Maneja la coma decimal (solo una)
        const parts = value.split(',');
        if (parts.length > 2) {
            value = parts[0] + ',' + parts.slice(1).join('');
        }

        // Agrega separadores de miles mientras se escribe
        if (parts[0].length > 3) {
            const integerPart = parts[0].replace(/\./g, '');
            const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            value = parts.length > 1 ? `${formatted},${parts[1]}` : formatted;
        }

        setEditValue(value);
    };

    return (
        <div className="relative">
            <Input
                className={"h-8 text-right bg-muted pr-10 " + className}
                readOnly
                value={formatPrice(field.value)}
            />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                        disabled={disabled}

                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                    <DialogTitle>Editar {label}</DialogTitle>
                    <div className="space-y-4">
                        <Input
                            autoFocus
                            type="text"
                            inputMode="decimal"
                            className="text-right text-lg font-medium"
                            value={editValue}
                            onChange={handleInputChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />
                        <div className="flex justify-between items-center">

                            <Button onClick={handleSave}>
                                Guardar
                            </Button>
                        </div>

                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};