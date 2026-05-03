export class SolicitarCaeDto {
  puntoVenta: number;
  tipoComprobante: number;
  nroComprobante: number;
  fechaComprobante: string;
  importeTotal: number;
  importeNeto: number;
  importeIva: number;
  cuitReceptor: string;
  condicionIvaReceptor: string;
  razonSocial?: string;
}
