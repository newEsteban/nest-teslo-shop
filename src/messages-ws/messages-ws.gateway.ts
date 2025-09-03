import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';

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
    private readonly messagesWsService: MessagesWsService
  ) {}

  handleConnection(client: Socket, ...args: any[]) {
    this.messagesWsService.registerClient(client);
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
  }
}