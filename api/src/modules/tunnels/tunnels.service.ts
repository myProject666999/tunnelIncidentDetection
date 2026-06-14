import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tunnel } from '../../entities/tunnel.entity';

@Injectable()
export class TunnelsService {
  private readonly logger = new Logger(TunnelsService.name);

  constructor(
    @InjectRepository(Tunnel)
    private tunnelsRepository: Repository<Tunnel>,
  ) {}

  async findAll() {
    this.logger.debug('Finding all tunnels');
    return this.tunnelsRepository.find();
  }

  async findOne(id: number) {
    this.logger.debug(`Finding tunnel with id: ${id}`);
    const tunnel = await this.tunnelsRepository.findOne({ where: { id } });
    if (!tunnel) {
      throw new NotFoundException(`隧道 #${id} 不存在`);
    }
    return tunnel;
  }
}
