import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface ConnectedClient {
    [id: string]: Socket
}

@Injectable()
export class MessagesWsService {

    private connectedClients: ConnectedClient = {};

    registerClient( client: Socket ) {
        this.connectedClients[client.id] = client;
        console.log(`Client registered: ${client.id}`);
    }

    removeClient( clientId: string ) {
       delete this.connectedClients[clientId];
    }

    getConnectedClients(): string[] {
        return Object.keys(this.connectedClients);
    }

}
