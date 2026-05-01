import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket): string {
    console.log(`Message received from ${client.id}:`, data);
    return 'pong';
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @SubscribeMessage('newMessage')
  async handleNewMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    // Log without exposing sensitive info if we had any extra logic
    console.log(`New message from user ${createMessageDto.senderId} via client ${client.id}`);
    
    // Save message (it gets encrypted before saving)
    await this.messagesService.saveMessage(createMessageDto);

    // Broadcast the plain text payload to other clients
    // (Assuming WSS is used and we want clients to read easily without client-side decryption)
    this.server.emit('messageReceived', createMessageDto);
  }
}
