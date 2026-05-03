import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { getToday } from '@/helpers/date';
import { transformToGenericFilters } from '@/helpers/filter-utils';
import { EnvioNotificacion } from './entities/envio-notificacion.entity';
import { PlantillaNotificacion } from '@/modules/plantilla-notificacion/entities/plantilla-notificacion.entity';
import { EnviarDto } from './dto/enviar.dto';
import { PreviewNotificacionDto } from './dto/preview-notificacion.dto';
import { EmailService } from '@/services/email/email.service';

/** Interfaz mínima que cualquier entidad notificable debe cumplir */
interface EntidadNotificable {
    id: number;
    clienteId?: number;
    cliente?: {
        id: number;
        nombre?: string;
        email?: string;
        telefono?: string;
        [key: string]: unknown;
    };
}

@Injectable()
export class EnvioNotificacionService {
    constructor(
        @InjectRepository(EnvioNotificacion)
        private repo: Repository<EnvioNotificacion>,
        @InjectRepository(PlantillaNotificacion)
        private plantillaRepo: Repository<PlantillaNotificacion>,
        private emailService: EmailService,
    ) { }

    // ─── CRUD ───────────────────────────────────────────────────────────────────

    async findAll(conditions: FindManyOptions<EnvioNotificacion>) {
        return await this.repo.find({
            ...conditions,
            where: transformToGenericFilters(conditions.where),
            relations: ['plantilla'],
        });
    }

    async findOne(id: number) {
        return await this.repo.findOne({
            where: { id },
            relations: ['plantilla', 'createdByUser'],
        });
    }

    async remove(id: number) {
        const entity = await this.findOne(id);
        await this.repo.delete({ id });
        return entity;
    }

    // ─── Búsqueda de entidades por modelo ───────────────────────────────────────
    // Extensión: agregar nuevos modelos en el switch según el proyecto.

    protected async buscarEntidades(
        modelo: string,
        _filtros: Record<string, unknown> | undefined,
    ): Promise<EntidadNotificable[]> {
        switch (modelo) {
            // Agregar nuevos modelos aquí:
            // case 'ejemplo':
            //     return this.ejemploRepo.find({ where, relations: ['cliente'] });

            default:
                throw new BadRequestException(`Modelo '${modelo}' no soportado para notificaciones`);
        }
    }

    // ─── Motor de interpolación de variables ─────────────────────────────────────
    // Extensión: agregar nuevos modelos en el switch según el proyecto.

    resolverVariables(
        modelo: string,
        template: string,
        _cliente: EntidadNotificable['cliente'],
        _entidades: EntidadNotificable[],
    ): string {
        if (!template) return '';

        switch (modelo) {
            // Agregar nuevos modelos aquí:
            // case 'ejemplo':
            //     return this.resolverVariablesEjemplo(template, cliente, entidades as Ejemplo[]);

            default:
                return template;
        }
    }

    // ─── Preview ─────────────────────────────────────────────────────────────────

    async preview(dto: PreviewNotificacionDto) {
        const entidades = await this.buscarEntidades(dto.modelo, dto.filtros);

        const porCliente = new Map<number, EntidadNotificable[]>();
        for (const entidad of entidades) {
            if (!entidad.clienteId || !entidad.cliente) continue;
            if (!porCliente.has(entidad.clienteId)) {
                porCliente.set(entidad.clienteId, []);
            }
            porCliente.get(entidad.clienteId).push(entidad);
        }

        return Array.from(porCliente.entries()).map(([clienteId, entidadesCliente]) => {
            const cliente = entidadesCliente[0].cliente;
            return {
                clienteId,
                nombre: cliente?.nombre,
                email: cliente?.email,
                telefono: cliente?.telefono,
                cantidadEntidades: entidadesCliente.length,
            };
        });
    }

    // ─── Enviar ──────────────────────────────────────────────────────────────────

    async enviar(dto: EnviarDto): Promise<{ total: number; registros: number }> {
        const plantilla = await this.plantillaRepo.findOne({
            where: { id: dto.plantillaId },
        });
        if (!plantilla) {
            throw new NotFoundException(`Plantilla ${dto.plantillaId} no encontrada`);
        }

        const entidades = await this.buscarEntidades(dto.modelo, dto.filtros);

        const porCliente = new Map<number, EntidadNotificable[]>();
        for (const entidad of entidades) {
            if (!entidad.clienteId || !entidad.cliente) continue;
            if (!porCliente.has(entidad.clienteId)) {
                porCliente.set(entidad.clienteId, []);
            }
            porCliente.get(entidad.clienteId).push(entidad);
        }

        if (dto.clienteIds?.length) {
            const permitidos = new Set(dto.clienteIds);
            for (const clienteId of porCliente.keys()) {
                if (!permitidos.has(clienteId)) porCliente.delete(clienteId);
            }
        }

        let totalRegistros = 0;

        for (const [, entidadesCliente] of porCliente.entries()) {
            const cliente = entidadesCliente[0]?.cliente;
            if (!cliente) continue;

            const cuerpoResuelto = this.resolverVariables(
                dto.modelo,
                plantilla.cuerpo,
                cliente,
                entidadesCliente,
            );
            const asuntoResuelto = plantilla.asunto
                ? this.resolverVariables(dto.modelo, plantilla.asunto, cliente, entidadesCliente)
                : null;

            const emailDestinatario = dto.canal === 'email' ? (cliente.email as string) : null;

            let estado: 'enviado' | 'error' = 'enviado';
            let error: string | null = null;

            try {
                if (dto.canal === 'email' && emailDestinatario) {
                    const para = dto.emailActivo ? emailDestinatario : (dto.emailTest || null);
                    if (para) {
                        await this.emailService.enviar({
                            para,
                            asunto: asuntoResuelto ?? plantilla.asunto ?? '(sin asunto)',
                            html: cuerpoResuelto,
                            from: dto.from || undefined,
                        });
                    }
                }
            } catch (err) {
                estado = 'error';
                error = err instanceof Error ? err.message : String(err);
            }

            const modeloId = entidadesCliente.length === 1 ? entidadesCliente[0].id : null;

            await this.repo.save({
                plantillaNotificacionId: plantilla.id,
                modelo: dto.modelo,
                modeloId,
                canal: dto.canal,
                estado,
                asuntoResuelto,
                cuerpoResuelto,
                fechaEnvio: getToday(),
                emailDestinatario,
                error,
            });

            totalRegistros++;
        }

        return {
            total: porCliente.size,
            registros: totalRegistros,
        };
    }
}
