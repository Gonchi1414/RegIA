import { Controller, Get, Delete } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async findAll() {
    return this.messagesService.getDecryptedMessages();
  }

  @Delete()
  async deleteAll() {
    await this.messagesService.deleteAllMessages();
    return { message: 'Todos los mensajes han sido eliminados correctamente.' };
  }
}
