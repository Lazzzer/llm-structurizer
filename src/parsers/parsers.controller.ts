import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ParsersListDto } from './dto/parsers-list.dto';

@ApiSecurity('apiKey')
@ApiTags('parsers')
@ApiUnauthorizedResponse({
  description: 'API key is invalid or missing',
})
@Controller({
  path: 'parsers',
  version: '1',
})
export class ParsersController {
  @ApiOkResponse({
    description: 'List of available parsers',
    type: ParsersListDto,
  })
  @Get()
  getParsersList(): ParsersListDto {
    return { availableParsers: ['pdf'] };
  }
}
