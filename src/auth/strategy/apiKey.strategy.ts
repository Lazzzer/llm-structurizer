import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthService } from '../auth.service';
@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private authService: AuthService) {
    super(
      { header: 'X-API-KEY', prefix: '' },
      true,
      async (apiKey: string, done) => {
        const isValidApiKey = await this.authService.validateApiKey(apiKey);
        return isValidApiKey
          ? done(null, true)
          : done(new UnauthorizedException(), false);
      },
    );
  }
}
