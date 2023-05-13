import {
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JsonService } from './json.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JsonExtractRequestDto } from './dto/jsonExtractRequest.dto';
import { InvalidJsonOutputError } from './exceptions/exceptions';
import { JsonExtractResultDto } from './dto/jsonExtractResult.dto';

@ApiUnauthorizedResponse({
  description: "The API key in request's header is missing or invalid.",
})
@ApiBadRequestResponse({
  description: 'The request body is invalid or missing.',
})
@ApiUnprocessableEntityResponse({
  description: 'The output is not valid json.',
})
@ApiSecurity('apiKey')
@ApiTags('structured-data')
@Controller({
  path: 'structured-data/json',
  version: '1',
})
export class JsonController {
  constructor(private readonly jsonService: JsonService) {}

  @ApiOperation({
    summary: 'Return structured data from text as json using a json schema',
    description: `This endpoint returns structured data from input text as json.  
    It accepts a json schema as model for data extraction. The Refine technique can be used for longer texts.\n

    Available model: gpt-3.5-turbo
    `,
  })
  @ApiOkResponse({
    type: JsonExtractResultDto,
    description:
      'The text was successfully structured as json. The output is a valid json object.',
  })
  @ApiBody({
    type: JsonExtractRequestDto,
    description:
      'Request body containing text to process as json and extraction parameters',
  })
  @HttpCode(200)
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
      const response: JsonExtractResultDto = {
        model,
        refine: refine || false,
        output: JSON.stringify(json),
      };
      return response;
    } catch (e) {
      if (e instanceof InvalidJsonOutputError) {
        throw new UnprocessableEntityException(e.message);
      }
      throw new InternalServerErrorException(e.message);
    }
  }
}
