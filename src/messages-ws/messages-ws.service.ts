import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/User.entity';
import { Repository } from 'typeorm';

interface ConnectedClient {
    [id: string]: {
        socket: Socket,
        user: User,
        desktop?: boolean
    }
}

@Injectable()
export class MessagesWsService {

    constructor(
        @InjectRepository(User)
        private readonly user: Repository<User>
    ) {}

    private connectedClients: ConnectedClient = {};

    async registerClient( client: Socket, userId: string ) {
        const user = await this.user.findOne({ where: { id: userId } });
        if ( !user ) throw new Error('User not found');
        if ( !user.isActive ) throw new Error('User is not active');    
        this.checkUserConnection( userId );

        this.connectedClients[client.id] = { socket: client, user };
        console.log(`Client registered: ${client.id}`);
    }

    removeClient( clientId: string ) {
       delete this.connectedClients[clientId];
    }

    getConnectedClients(): string[] {
        return Object.keys(this.connectedClients);
    }

    getUserFullName( clientId: string ) {
        return this.connectedClients[clientId]?.user.fullName || 'Unknown';
    }

    checkUserConnection( userId: string ) {
        const isConnected = Object.values(this.connectedClients).some( client => client.user.id === userId );
        if(isConnected){
            const currentUser = Object.values(this.connectedClients).find( client => client.user.id === userId );
            if(currentUser){
                currentUser.socket.disconnect();
            }
        }
    }

}
