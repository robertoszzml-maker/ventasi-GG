import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { create } from 'xmlbuilder2';
import * as soap from 'soap';
import { ConfigService } from '@nestjs/config';

interface AfipLoginResponse {
    token: string;
    sign: string;
    expirationTime: string;
}

@Injectable()
export class LoginService {
    private credentialsCache: Record<string, AfipLoginResponse> = {};

    constructor(private readonly configService: ConfigService) { }

    /**
     * Devuelve credenciales para un servicio AFIP.
     * Usa cache en memoria y solo llama a WSAA si expiraron o no existen.
     */
    async getCredentials(service: string): Promise<AfipLoginResponse> {
        const cached = this.credentialsCache[service];

        // Si existe y no expiró → devolver
        if (cached && new Date() < new Date(cached.expirationTime)) {
            return cached;
        }

        const fresh = await this.loginCms(service);
        this.credentialsCache[service] = fresh;
        return fresh;
    }

    /**
     * Hace login contra WSAA para un servicio y devuelve nuevas credenciales.
     */
    async loginCms(service: string): Promise<AfipLoginResponse> {
        const now = new Date();
        const seqNr = now.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

        const tempDir = this.configService.get<string>('TEMP_DIR', './temp');
        const wsaaUrl = this.configService.get<string>('AFIP_WSAA_URL');
        const certificadoPath = this.configService.get<string>('AFIP_CERTIFICADO_PATH');
        const clavePrivadaPath = this.configService.get<string>('AFIP_CLAVE_PRIVADA_PATH');

        const OutXml = path.join(tempDir, `${seqNr}-LoginTicketRequest.xml`);
        const OutCmsDer = path.join(tempDir, `${seqNr}-LoginTicketRequest.xml.cms-DER`);
        const OutCmsB64 = path.join(tempDir, `${seqNr}-LoginTicketRequest.xml.cms-DER-b64`);
        const OutResp = path.join(tempDir, `${seqNr}-loginTicketResponse.xml`);
        const OutError = path.join(tempDir, `${seqNr}-loginTicketResponse-ERROR.xml`);

        try {
            // Asegurar directorio temporal
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Rutas absolutas de certificado y clave
            const certificado = path.resolve(certificadoPath!);
            const clave = path.resolve(clavePrivadaPath!);

            // Validar existencia
            if (!fs.existsSync(certificado)) {
                throw new Error(`No se encontró el certificado en: ${certificado}`);
            }
            if (!fs.existsSync(clave)) {
                throw new Error(`No se encontró la clave privada en: ${clave}`);
            }

            // PASO 1: Crear el XML del LoginTicketRequest
            const genTime = new Date(now.getTime() - 10 * 60000).toISOString();
            const expTime = new Date(now.getTime() + 10 * 60000).toISOString();
            const uniqueId = now.toISOString().replace(/[-:TZ.]/g, '').slice(2, 12);

            const xml = create({ version: '1.0', encoding: 'UTF-8' })
                .ele('loginTicketRequest')
                .ele('header')
                .ele('uniqueId').txt(uniqueId).up()
                .ele('generationTime').txt(genTime).up()
                .ele('expirationTime').txt(expTime).up()
                .up()
                .ele('service').txt(service)
                .end({ prettyPrint: true });

            fs.writeFileSync(OutXml, xml);

            // PASO 2: Firmar el CMS con openssl
            execSync(
                `openssl cms -sign -in ${OutXml} -signer ${certificado} -inkey ${clave} -nodetach -outform der -out ${OutCmsDer}`,
            );

            // PASO 3: Codificar en Base64
            execSync(`openssl base64 -in ${OutCmsDer} -e -out ${OutCmsB64}`);

            // PASO 4: Consumir el WSAA con el CMS firmado
            const cms = fs.readFileSync(OutCmsB64, 'utf-8').replace(/\r?\n/g, '');
            const client = await soap.createClientAsync(wsaaUrl!);
            const [result] = await client.loginCmsAsync({ in0: cms });
            const xmlResponse = result.loginCmsReturn;

            fs.writeFileSync(OutResp, xmlResponse);

            // Extraer credenciales
            const tokenMatch = xmlResponse.match(/<token>(.*?)<\/token>/);
            const signMatch = xmlResponse.match(/<sign>(.*?)<\/sign>/);
            const expirationTimeMatch = xmlResponse.match(/<expirationTime>(.*?)<\/expirationTime>/);

            if (!tokenMatch || !signMatch || !expirationTimeMatch) {
                throw new Error('No se pudieron extraer las credenciales de la respuesta AFIP');
            }

            const token = tokenMatch[1];
            const sign = signMatch[1];
            const expirationTime = expirationTimeMatch[1];

            // Limpiar temporales
            [OutXml, OutCmsDer, OutCmsB64].forEach((file) => {
                if (fs.existsSync(file)) fs.unlinkSync(file);
            });

            return { token, sign, expirationTime };
        } catch (error: any) {
            console.error('Error al invocar al WSAA:', error.message);
            fs.writeFileSync(OutError, error.message);
            throw error;
        }
    }
}
