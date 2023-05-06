import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  validateApiKey(apiKey: string): boolean {
    const validApiKeys = ['1234567890', '0987654321'];
    return validApiKeys.includes(apiKey);
  }
}
