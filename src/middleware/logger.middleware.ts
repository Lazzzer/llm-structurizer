import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ISOLogger } from 'src/config/isoLogger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new ISOLogger('HTTP');
  use(req: Request, _res: Response, next: NextFunction) {
    this.logger.log(`${req.method} ${req.originalUrl}`);
    next();
  }
}
