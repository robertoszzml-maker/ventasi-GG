import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WsfeService } from './wsfe.service';
import { SolicitarCaeDto } from './dto/solicitar-cae.dto';
import { UltimoComprobanteDto } from './dto/ultimo-comprobante.dto';

@Controller()
export class WsfeController {
  constructor(private readonly wsfeService: WsfeService) {}

  @MessagePattern('solicitar-cae')
  solicitarCae(@Payload() dto: SolicitarCaeDto) {
    return this.wsfeService.solicitarCae(dto);
  }

  @MessagePattern('obtener-ultimo-comprobante')
  obtenerUltimoComprobante(@Payload() dto: UltimoComprobanteDto) {
    return this.wsfeService.obtenerUltimoComprobante(dto);
  }
}
