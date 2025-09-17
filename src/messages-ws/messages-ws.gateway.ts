import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({
  cors: true,
})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect  {

  

  /**
   * Instancia del servidor WebSocket proporcionada por el decorador `@WebSocketServer()`.
   * Esta línea de código inyecta el servidor de WebSocket de Socket.IO en la propiedad `wws`,
   * permitiendo emitir y escuchar eventos en tiempo real dentro del gateway de NestJS.
   */
  @WebSocketServer() wws: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id );
    } catch (error) {
      client.disconnect();
      return;
    }
    console.log({ payload });
    this.wws.emit('client-update', this.messagesWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.wws.emit('client-update', this.messagesWsService.getConnectedClients());
  }


  //Escuchar el evento 'message-from-client' y emitirlo a todos los clientes conectados
  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    console.log('Message from client:', payload);
    console.log('Socket from client:', client.id);
    // this.wws.emit('message-from-server', payload);
    //! Emitir el mensaje a todos los clientes conectados, excepto al que envió el mensaje
   
    // Emitir a todos los clientes excepto al que envió el mensaje
    client.broadcast.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message'
    });
    //! Emitir el mensaje solo al cliente que envió el mensaje
    // client.emit('message-from-server', {
    //   fullName: 'soy un server',
    //   message: payload.message || 'no-message'
    // });
  }
}