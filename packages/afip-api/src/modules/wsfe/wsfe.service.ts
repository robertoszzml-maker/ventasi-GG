import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as soap from 'soap';
import { LoginService } from 'src/services/login/login.service';
import { SolicitarCaeDto } from './dto/solicitar-cae.dto';
import { UltimoComprobanteDto } from './dto/ultimo-comprobante.dto';

const WSFE_SERVICE = 'wsfe';

@Injectable()
export class WsfeService {
  constructor(
    private readonly loginService: LoginService,
    private readonly configService: ConfigService,
  ) {}

  async solicitarCae(dto: SolicitarCaeDto) {
    const { token, sign } = await this.loginService.getCredentials(WSFE_SERVICE);
    const cuitRepresentada = this.configService.get<string>('CUIT_REPRESENTADA');
    const wsfeWsdl = this.configService.get<string>('AFIP_WSFE_URL', '');

    const client = await soap.createClientAsync(wsfeWsdl);

    // Mapear condición IVA receptor al código ARCA
    const ivaReceptorCodigo = this.mapCondicionIva(dto.condicionIvaReceptor);

    const params = {
      Auth: { Token: token, Sign: sign, Cuit: cuitRepresentada },
      FeCAEReq: {
        FeCabReq: {
          CantReg: 1,
          PtoVta: dto.puntoVenta,
          CbteTipo: dto.tipoComprobante,
        },
        FeDetReq: {
          FECAEDetRequest: {
            Concepto: 1,
            DocTipo: dto.condicionIvaReceptor === 'CF' ? 99 : 80,
            DocNro: parseInt(dto.cuitReceptor.replace(/-/g, '')) || 0,
            CbteDesde: dto.nroComprobante,
            CbteHasta: dto.nroComprobante,
            CbteFch: dto.fechaComprobante,
            ImpTotal: dto.importeTotal,
            ImpTotConc: 0,
            ImpNeto: dto.importeNeto,
            ImpOpEx: 0,
            ImpIVA: dto.importeIva,
            ImpTrib: 0,
            MonId: 'PES',
            MonCotiz: 1,
            Iva: {
              AlicIva: {
                Id: 5, // 21%
                BaseImp: dto.importeNeto,
                Importe: dto.importeIva,
              },
            },
          },
        },
      },
    };

    return new Promise((resolve) => {
      client.Service.ServiceSoap12.FECAESolicitar(params, (err: any, result: any) => {
        if (err) {
          return resolve({ error: true, mensaje: err.message });
        }

        const detResp = result?.FECAESolicitarResult?.FeDetResp?.FECAEDetResponse;
        if (!detResp) {
          return resolve({ error: true, mensaje: 'Respuesta inesperada de ARCA' });
        }

        if (detResp.Resultado === 'A') {
          return resolve({
            error: false,
            cae: detResp.CAE,
            caeVencimiento: detResp.CAEFchVto,
            nroComprobante: detResp.CbteDesde,
          });
        }

        const obs = detResp.Observaciones?.Obs;
        const mensaje = Array.isArray(obs)
          ? obs.map((o: any) => `${o.Code}: ${o.Msg}`).join(', ')
          : obs ? `${obs.Code}: ${obs.Msg}` : 'Error desconocido de ARCA';

        resolve({ error: true, codigo: detResp.Resultado, mensaje });
      });
    });
  }

  async obtenerUltimoComprobante(dto: UltimoComprobanteDto) {
    const { token, sign } = await this.loginService.getCredentials(WSFE_SERVICE);
    const cuitRepresentada = this.configService.get<string>('CUIT_REPRESENTADA');
    const wsfeWsdl = this.configService.get<string>('AFIP_WSFE_URL', '');

    const client = await soap.createClientAsync(wsfeWsdl);

    const params = {
      Auth: { Token: token, Sign: sign, Cuit: cuitRepresentada },
      PtoVta: dto.puntoVenta,
      CbteTipo: dto.tipoComprobante,
    };

    return new Promise((resolve) => {
      client.Service.ServiceSoap12.FECompUltimoAutorizado(params, (err: any, result: any) => {
        if (err) {
          return resolve({ ultimoNro: 0 });
        }
        const nro = result?.FECompUltimoAutorizadoResult?.CbteNro ?? 0;
        resolve({ ultimoNro: nro });
      });
    });
  }

  private mapCondicionIva(condicion: string): number {
    const mapa: Record<string, number> = {
      RI: 1, CF: 5, MONO: 6, EXENTO: 4, NO_RESP: 7,
    };
    return mapa[condicion] ?? 5;
  }
}
