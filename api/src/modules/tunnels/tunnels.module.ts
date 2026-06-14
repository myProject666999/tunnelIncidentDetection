import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TunnelsService } from './tunnels.service';
import { TunnelsController } from './tunnels.controller';
import { Tunnel } from '../../entities/tunnel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tunnel])],
  controllers: [TunnelsController],
  providers: [TunnelsService],
  exports: [TunnelsService],
})
export class TunnelsModule {}
