import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface OpcionesEmail {
    para: string | string[];
    asunto: string;
    html: string;
    from?: string;
    adjuntos?: {
        nombre: string;
        contenido: Buffer;
        tipo?: string;
    }[];
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: Transporter;

    constructor(private configService: ConfigService) {
        const smtp = this.configService.get('configSMTP');
        this.transporter = nodemailer.createTransport({
            host: smtp.connect.host,
            auth: {
                user: smtp.connect.user,
                pass: smtp.connect.password,
            },
        });
    }

    async enviar(opciones: OpcionesEmail): Promise<void> {
        const smtp = this.configService.get('configSMTP');
        try {
            await this.transporter.sendMail({
                from: opciones.from ?? smtp.connect.from,
                to: Array.isArray(opciones.para) ? opciones.para.join(', ') : opciones.para,
                subject: opciones.asunto,
                html: opciones.html,
                attachments: opciones.adjuntos?.map((adj) => ({
                    filename: adj.nombre,
                    content: adj.contenido,
                    contentType: adj.tipo ?? 'application/octet-stream',
                })),
            });
            this.logger.log(`Email enviado a: ${opciones.para}`);
        } catch (error) {
            this.logger.error(`Error al enviar email a ${opciones.para}: ${error.message}`);
            throw new Error(`Error al enviar email: ${error.message}`);
        }
    }
}
