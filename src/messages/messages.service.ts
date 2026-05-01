import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CipherService } from '../security/cipher.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly cipherService: CipherService,
  ) {}

  async saveMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const { senderId, content } = createMessageDto;

    // Encrypt the message content
    const { ciphertext, iv, authTag } = this.cipherService.encrypt(content);

    // Save the encrypted message to the database
    const message = this.messagesRepository.create({
      senderId,
      content: ciphertext,
      iv,
      authTag,
    });

    return await this.messagesRepository.save(message);
  }

  // Example method to get decrypted messages history
  async getDecryptedMessages(): Promise<any[]> {
    const messages = await this.messagesRepository.find({
      order: { timestamp: 'ASC' },
    });

    return messages.map((msg) => {
      try {
        const decryptedContent = this.cipherService.decrypt(
          msg.content,
          msg.iv,
          msg.authTag,
        );
        return {
          id: msg.id,
          senderId: msg.senderId,
          content: decryptedContent,
          timestamp: msg.timestamp,
        };
      } catch (error) {
        // Skip messages that cannot be decrypted
        return {
          id: msg.id,
          senderId: msg.senderId,
          content: '[Decryption Error]',
          timestamp: msg.timestamp,
        };
      }
    });
  }
}
