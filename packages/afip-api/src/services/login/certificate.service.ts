import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CertificateService {
  constructor(private readonly configService: ConfigService) { }

  /**
   * Obtiene el contenido del certificado desde archivo o variable de entorno (Railway)
   */
  getCertificateContent(): string {
    // Primero intentar desde variables divididas (Railway con límite de caracteres)
    const certParts = [
      this.configService.get<string>('AFIP_CERT_BASE64_1'),
      this.configService.get<string>('AFIP_CERT_BASE64_2'),
      this.configService.get<string>('AFIP_CERT_BASE64_3')
    ].filter(Boolean);

    if (certParts.length > 0) {
      // Railway: concatenar y decodificar desde base64
      try {
        const certBase64 = certParts.join('');
        return Buffer.from(certBase64, 'base64').toString('utf-8');
      } catch (error) {
        throw new Error('Error al decodificar certificado desde variables AFIP_CERT_BASE64_*');
      }
    }

    // Sino, intentar desde variable única (Railway sin límite)
    const certBase64 = this.configService.get<string>('AFIP_CERT_BASE64');

    if (certBase64) {
      // Railway: decodificar desde base64
      try {
        return Buffer.from(certBase64, 'base64').toString('utf-8');
      } catch (error) {
        throw new Error('Error al decodificar certificado desde variable de entorno AFIP_CERT_BASE64');
      }
    }

    // Sino, intentar desde archivo (desarrollo local)
    const certPath = this.configService.get<string>('AFIP_CERTIFICADO_PATH');
    if (certPath && fs.existsSync(certPath)) {
      return fs.readFileSync(certPath, 'utf-8');
    }

    throw new Error('No se encontró certificado. Configure AFIP_CERT_BASE64_* o AFIP_CERT_BASE64 o AFIP_CERTIFICADO_PATH');
  }

  /**
   * Obtiene el contenido de la clave privada desde archivo o variable de entorno (Railway)
   */
  getPrivateKeyContent(): string {
    // Primero intentar desde variables divididas (Railway con límite de caracteres)
    const keyParts = [
      this.configService.get<string>('AFIP_KEY_BASE64_1'),
      this.configService.get<string>('AFIP_KEY_BASE64_2'),
      this.configService.get<string>('AFIP_KEY_BASE64_3')
    ].filter(Boolean);

    if (keyParts.length > 0) {
      // Railway: concatenar y decodificar desde base64
      try {
        const keyBase64 = keyParts.join('');
        return Buffer.from(keyBase64, 'base64').toString('utf-8');
      } catch (error) {
        throw new Error('Error al decodificar clave privada desde variables AFIP_KEY_BASE64_*');
      }
    }

    // Sino, intentar desde variable única (Railway sin límite)
    const keyBase64 = this.configService.get<string>('AFIP_KEY_BASE64');

    if (keyBase64) {
      // Railway: decodificar desde base64
      try {
        return Buffer.from(keyBase64, 'base64').toString('utf-8');
      } catch (error) {
        throw new Error('Error al decodificar clave privada desde variable de entorno AFIP_KEY_BASE64');
      }
    }

    // Sino, intentar desde archivo (desarrollo local)
    const keyPath = this.configService.get<string>('AFIP_CLAVE_PRIVADA_PATH');
    if (keyPath && fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath, 'utf-8');
    }

    throw new Error('No se encontró clave privada. Configure AFIP_KEY_BASE64_* o AFIP_KEY_BASE64 o AFIP_CLAVE_PRIVADA_PATH');
  }

  /**
   * Crea archivos temporales del certificado y clave para usar con openssl
   */
  async createTempFiles(): Promise<{ certPath: string; keyPath: string }> {
    const tempDir = this.configService.get<string>('TEMP_DIR', '/tmp');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const certPath = path.join(tempDir, `${timestamp}-cert.crt`);
    const keyPath = path.join(tempDir, `${timestamp}-key.key`);

    try {
      // Escribir contenido decodificado a archivos temporales
      fs.writeFileSync(certPath, this.getCertificateContent());
      fs.writeFileSync(keyPath, this.getPrivateKeyContent());

      return { certPath, keyPath };
    } catch (error) {
      // Limpiar archivos si hubo error
      [certPath, keyPath].forEach(file => {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      });
      throw error;
    }
  }

  /**
   * Limpia archivos temporales
   */
  cleanupTempFiles(paths: string[]): void {
    paths.forEach(path => {
      if (fs.existsSync(path)) {
        try {
          fs.unlinkSync(path);
        } catch (error) {
          console.warn(`No se pudo eliminar archivo temporal: ${path}`);
        }
      }
    });
  }
}
