import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'node:crypto';

@Injectable()
export class CipherService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const rawKey = this.configService.get<string>('ENCRYPTION_KEY', 'default-unsafe-key');
    // We use SHA-256 to ensure the key is exactly 32 bytes long
    this.key = crypto.createHash('sha256').update(rawKey).digest();
  }

  encrypt(text: string): { ciphertext: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(12); // GCM standard is 12 bytes
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return {
      ciphertext: encrypted,
      iv: iv.toString('hex'),
      authTag,
    };
  }

  decrypt(ciphertext: string, ivHex: string, authTagHex: string): string {
    try {
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      // In case of integrity failure or other cryptographic error
      console.error('Decryption failed. Data might be corrupted or tampered with.');
      throw new BadRequestException('Invalid encrypted data or integrity check failed');
    }
  }
}
