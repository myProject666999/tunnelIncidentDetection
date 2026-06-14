import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { WebSocketServer, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/',
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  emitIncidentCreated(incident: any) {
    this.logger.debug(`Emitting incident:created event for incident #${incident.id}`);
    this.server.emit('incident:created', incident);
  }

  emitIncidentUpdated(incident: any) {
    this.logger.debug(`Emitting incident:updated event for incident #${incident.id}`);
    this.server.emit('incident:updated', incident);
  }

  emitExecutionProgress(execution: any) {
    this.logger.debug(`Emitting execution:progress event for execution #${execution.id}`);
    this.server.emit('execution:progress', execution);
  }

  emitDeviceStatus(device: any) {
    this.logger.debug(`Emitting device:status event for device #${device.id}`);
    this.server.emit('device:status', device);
  }

  emitTimelineNew(timeline: any) {
    this.logger.debug(`Emitting timeline:new event for timeline #${timeline.id}`);
    this.server.emit('timeline:new', timeline);
  }
}
