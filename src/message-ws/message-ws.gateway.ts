import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JwtPayload } from 'src/auth/interfaces';
import { NewMessageDto } from './dtos/new-message.dto';
import { MessageWsService } from './message-ws.service';

@WebSocketGateway({ cors: true })
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService
    ) {}
  
  handleDisconnect(client: Socket) {
    this.messageWsService.removeClient( client.id );

    this.wss.emit('clients-updated', this.messageWsService.getConnectedClients() );
  }

  async handleConnection(client: Socket) {

    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify( token );
      await this.messageWsService.registerClient( client, payload.id );

    } catch (error) {
      client.disconnect();
      return;
    }

    this.wss.emit('clients-updated', this.messageWsService.getConnectedClients() );
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient( client: Socket, payload: NewMessageDto ) {
  
    //! Emite únicamente al cliente.
    // client.emit('message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!'
    // });

    //! Emitir a todos MENOS, al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!'
    // });

    this.wss.emit('message-from-server', {
      fullName: this.messageWsService.getUserFullName(client.id),
      message: payload.message || 'no-message!!'
    });

  }

}
