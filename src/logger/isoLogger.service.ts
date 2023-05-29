import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.TRANSIENT })
export class ISOLogger extends ConsoleLogger {
  constructor(private configService: ConfigService) {
    super('default', { timestamp: true });
    this.setLogLevels(this.configService.get('logLevel'));
  }

  protected getTimestamp(): string {
    return new Date().toISOString();
  }
}
