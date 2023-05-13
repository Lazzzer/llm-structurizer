import { Body, Controller, Post } from '@nestjs/common';
import { JsonService } from './json.service';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JsonExtractRequestDto } from './dto/JsonExtractRequest.dto';

@ApiSecurity('apiKey')
@ApiTags('structured-data')
@Controller({
  path: 'structured-data/json',
  version: '1',
})
export class JsonController {
  constructor(private readonly jsonService: JsonService) {}

  @Post()
  async extract(@Body() request: JsonExtractRequestDto) {
    // TODO: implement
  }
}
