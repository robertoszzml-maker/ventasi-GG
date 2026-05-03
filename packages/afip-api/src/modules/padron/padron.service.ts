import { Injectable } from '@nestjs/common';
import { CreatePadronDto } from './dto/create-padron.dto';
import { LoginService } from 'src/services/login/login.service';
import { ConfigService } from '@nestjs/config';
import * as soap from 'soap';

@Injectable()
export class PadronService {
  constructor(
    private readonly loginService: LoginService,
    private readonly configService: ConfigService,
  ) { }

  async getPadron(createPadronDto: CreatePadronDto) {
    // 1. Obtener credenciales desde WSAA
    const padronServiceName = this.configService.get<string>(
      'PADRON_SERVICE', ''
    );
    const { token, sign } = await this.loginService.getCredentials(padronServiceName);
    const cuitRepresentada = this.configService.get<string>(
      'CUIT_REPRESENTADA',
    );
    const padronWsdl = this.configService.get<string>(
      'PADRON_WSDL', ''
    );
    // 3. Crear cliente SOAP
    const client = await soap.createClientAsync(padronWsdl);

    // 4. Parámetros para el request
    const params = {
      token,
      sign,
      cuitRepresentada,
      idPersona: createPadronDto.cuit,
    };

    // 5. Invocar al método getPersona
    return new Promise((resolve, reject) => {
      client.PersonaServiceA5.PersonaServiceA5Port.getPersona(
        params,
        (err, result) => {
          if (err) {
            return reject(
              new Error(
                `Error en la respuesta del servicio de padrón: ${err.message}`,
              ),
            );
          }
          resolve(result);
        },
      );
    });
  }
}
