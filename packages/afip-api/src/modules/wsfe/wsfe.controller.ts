import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { WsfeService } from './wsfe.service';
import { SolicitarCaeDto } from './dto/solicitar-cae.dto';
import { UltimoComprobanteDto } from './dto/ultimo-comprobante.dto';

@Controller('afip/wsfe')
export class WsfeController {
  constructor(private readonly wsfeService: WsfeService) { }

  @Post('solicitar-cae')
  solicitarCae(@Body() dto: SolicitarCaeDto) {
    return this.wsfeService.solicitarCae(dto);
  }

  @Get('ultimo-comprobante')
  obtenerUltimoComprobante(@Query() dto: UltimoComprobanteDto) {
    return this.wsfeService.obtenerUltimoComprobante(dto);
  }
}
