import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthService } from '../auth.service';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
        if (!UUID_REGEX.test(apiKey)) {
          return done(
            new UnauthorizedException('Invalid API key format'),
            false,
          );
        }
        const validApiKey = await this.authService.validateApiKey(apiKey);
        return validApiKey
          ? done(null, true)
          : done(new UnauthorizedException(), false);
      },
    );
  }
}
