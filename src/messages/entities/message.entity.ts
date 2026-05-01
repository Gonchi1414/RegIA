import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  senderId: string;

  @Column({ type: 'text' })
  content: string; // This will store the ciphertext

  @Column()
  iv: string;

  @Column()
  authTag: string;

  @CreateDateColumn()
  timestamp: Date;
}
