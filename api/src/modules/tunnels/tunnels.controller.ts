import { Controller, Get, Param, Logger } from '@nestjs/common';
import { TunnelsService } from './tunnels.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('tunnels')
export class TunnelsController {
  private readonly logger = new Logger(TunnelsController.name);

  constructor(private readonly tunnelsService: TunnelsService) {}

  @Public()
  @Get()
  findAll() {
    this.logger.debug('GET /tunnels');
    return this.tunnelsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.debug(`GET /tunnels/${id}`);
    return this.tunnelsService.findOne(+id);
  }
}
