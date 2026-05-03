import { IsArray, IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, ArrayNotEmpty } from 'class-validator';

export class EnviarDto {
    @IsNumber()
    plantillaId: number;

    @IsEnum(['email', 'whatsapp'])
    canal: string;

    /**
     * Tipo de entidad al que aplica la notificación.
     * Determina el repositorio y las variables de interpolación a usar.
     * Valores actuales: 'factura'
     * Futuros: 'presupuesto', 'contrato', etc.
     */
    @IsString()
    modelo: string;

    /**
     * Filtros en el mismo formato que usa el dashboard correspondiente.
     * Para envío individual: { "id": entidadId }
     * Para envío masivo: { "estado": ["pendiente", "parcial"], ... }
     * Sin filtros: se notifica a todos los clientes.
     */
    @IsOptional()
    @IsObject()
    filtros?: Record<string, unknown>;

    /**
     * IDs de clientes a incluir en el envío.
     * Si se especifica, solo se notifica a los clientes de esta lista.
     * Si está ausente, se notifica a todos los que coincidan con los filtros.
     */
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    clienteIds?: number[];

    /**
     * Tipos de contacto del cliente a usar como destinatarios.
     * Email: 'email' (principal), 'emailPagoProveedores' (pago de proveedores).
     * WhatsApp: 'telefono' (principal), 'telefonoPagoProveedores' (pago de proveedores).
     * Por defecto según canal: ['email'] o ['telefono'].
     * Si se pasan múltiples tipos, se crea un registro por cada contacto disponible.
     */
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    tiposContacto?: string[];

    @IsOptional()
    @IsString()
    from?: string;

    @IsOptional()
    @IsBoolean()
    emailActivo?: boolean;

    @IsOptional()
    @IsString()
    emailTest?: string;
}
