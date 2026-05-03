import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PadronService } from './padron.service';
import { CreatePadronDto } from './dto/create-padron.dto';

@Controller()
export class PadronController {
  constructor(private readonly padronService: PadronService) { }

  @MessagePattern('get-padron')
  getPadron(@Payload() createPadronDto: CreatePadronDto) {

    return this.padronService.getPadron(createPadronDto);
  }

}
