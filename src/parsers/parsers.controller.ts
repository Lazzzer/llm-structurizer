import { Controller, Get } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiSecurity('apiKey')
@ApiTags('parsers')
@Controller({
  path: 'parsers',
  version: '1',
})
export class ParsersController {
  @Get()
  getHello(): string {
    return 'Hello World from ParsersController!';
  }
}
