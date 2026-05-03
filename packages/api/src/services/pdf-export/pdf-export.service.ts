import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import { join } from 'path';
import { Blob } from 'buffer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PdfExportService {
    private readonly gotenbergUrl: string;

    constructor(private configService: ConfigService) {
        this.gotenbergUrl = process.env.GOTENBERG_URL
    }

    async generatePdf(templateName: string, data: any): Promise<Buffer> {
        try {
            // 1. Compilar template Handlebars
            const templatePath = join(__dirname, `../../templates/${templateName}.hbs`);
            const templateSource = fs.readFileSync(templatePath, 'utf-8');

            Handlebars.registerHelper('divide', function (a, b) {
                if (!a || !b) return 0;
                return (a / b).toFixed(2);
            });

            Handlebars.registerHelper('separadorMiles', function (number) {
                const parsed = typeof number === 'string' ? parseFloat(number) : number;
                if (isNaN(parsed)) return number;
                return parsed.toLocaleString('es-AR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            });

            Handlebars.registerHelper('inc', function (value) {
                return parseInt(value) + 1;
            });

            const template = Handlebars.compile(templateSource);
            const html = template(data);

            // 2. Crear FormData manualmente (sin paquetes externos)
            const boundary = `----WebKitFormBoundary${Math.random().toString(16).substring(2)}`;
            let body = '';

            // Añadir archivo HTML
            body += `--${boundary}\r\n`;
            body += 'Content-Disposition: form-data; name="files"; filename="index.html"\r\n';
            body += 'Content-Type: text/html\r\n\r\n';
            body += `${html}\r\n`;

            // Añadir opciones de PDF
            const pdfOptions = {
                marginTop: '0',
                marginBottom: '0',
                marginLeft: '0',
                marginRight: '0',
                paperWidth: '8.27',
                paperHeight: '11.69',
                preferCssPageSize: 'true',
                printBackground: 'true'
            };

            for (const [key, value] of Object.entries(pdfOptions)) {
                body += `--${boundary}\r\n`;
                body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
                body += `${value}\r\n`;
            }

            body += `--${boundary}--\r\n`;

            // 3. Enviar solicitud a Gotenberg
            const response = await fetch(`${this.gotenbergUrl}/forms/chromium/convert/html`, {
                method: 'POST',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                    'Accept': 'application/pdf'
                },
                body
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en Gotenberg: ${errorText}`);
            }

            return Buffer.from(await response.arrayBuffer());

        } catch (error) {
            console.error('Error generando PDF:', {
                message: error.message,
                stack: error.stack
            });
            throw new Error(`Error al generar PDF: ${error.message}`);
        }
    }
}