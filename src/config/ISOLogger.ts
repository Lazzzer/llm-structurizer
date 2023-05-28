import { ConsoleLogger } from '@nestjs/common';

export class ISOLogger extends ConsoleLogger {
  protected getTimestamp(): string {
    return new Date().toISOString();
  }
}
