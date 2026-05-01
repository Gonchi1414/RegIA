import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    SecurityModule,
  ],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
