export class CreateAuditoriaDto {
    tabla: string;
    columna: string;
    valorAnterior?: any;
    valorNuevo?: any;
    registroId: number;
    usuarioId?: number;
    fecha?: string;
}
