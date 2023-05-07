import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKey } from 'src/database/entities/api-key.entity';
import { Repository } from 'typeorm';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async validateApiKey(apiKey: string) {
    const apiKeyExists = await this.apiKeyRepository.findOneBy({ id: apiKey });
    console.log(apiKeyExists, !!apiKeyExists);
    return !!apiKeyExists;
  }
}
