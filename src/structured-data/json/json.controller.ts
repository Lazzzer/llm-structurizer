import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JsonService } from './json.service';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JsonExtractRequestDto } from './dto/JsonExtractRequest.dto';
import { InvalidJsonOutputError } from './exceptions/exceptions';

@ApiSecurity('apiKey')
@ApiTags('structured-data')
@Controller({
  path: 'structured-data/json',
  version: '1',
})
export class JsonController {
  constructor(private readonly jsonService: JsonService) {}

  @Post('schema')
  async extractSchema(@Body() request: JsonExtractRequestDto) {
    const { text, model, jsonSchema, refine } = request;
    const extractionMethod = refine
      ? 'extractWithSchemaAndRefine'
      : 'extractWithSchema';
    try {
      const json = await this.jsonService[extractionMethod](
        text,
        model,
        jsonSchema,
      );
      return json;
    } catch (e) {
      if (e instanceof InvalidJsonOutputError) {
        throw new UnprocessableEntityException(e.message);
      }
      throw new InternalServerErrorException(e.message);
    }
  }
}
