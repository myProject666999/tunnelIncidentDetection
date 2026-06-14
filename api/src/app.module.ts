import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TunnelsModule } from './modules/tunnels/tunnels.module';
import { DevicesModule } from './modules/devices/devices.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { TimelinesModule } from './modules/timelines/timelines.module';
import { PlansModule } from './modules/plans/plans.module';
import { ExecutionsModule } from './modules/executions/executions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'tunnel_incident',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    UsersModule,
    TunnelsModule,
    DevicesModule,
    IncidentsModule,
    TimelinesModule,
    PlansModule,
    ExecutionsModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
