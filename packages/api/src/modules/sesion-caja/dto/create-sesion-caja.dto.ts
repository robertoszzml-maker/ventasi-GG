export class AbrirCajaDto {
  cajaId: number;
  saldoInicialConfirmado: string;
  observaciones?: string;
}

export class CerrarCajaDto {
  observaciones?: string;
}
