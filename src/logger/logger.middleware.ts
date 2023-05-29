import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ISOLogger } from './isoLogger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private logger: ISOLogger) {
    this.logger.setContext('HTTP Request');
  }
  use(req: Request, _res: Response, next: NextFunction) {
    this.logger.log(`${req.method} ${req.originalUrl}`);
    next();
  }
}
