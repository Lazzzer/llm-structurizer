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
import {
  JsonExtractExampleRequestDto,
  JsonExtractSchemaRequestDto,
} from './dto/jsonExtractRequest.dto';
import { InvalidJsonOutputError } from './exceptions/exceptions';
import { JsonExtractResultDto } from './dto/jsonExtractResult.dto';
import { JsonAnalyzeRequestDto } from './dto/jsonAnalyzeRequest.dto';
import { Analysis, JsonAnalyzeResultDto } from './dto/jsonAnalyzeResult.dto';

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

    Available models: gpt-3.5-turbo, gpt-4
    `,
  })
  @ApiOkResponse({
    type: JsonExtractResultDto,
    description:
      'The text was successfully structured as json. The output is a valid json object.',
  })
  @ApiBody({
    type: JsonExtractSchemaRequestDto,
    description:
      'Request body containing text to process as json and extraction parameters',
  })
  @HttpCode(200)
  @Post('schema')
  async extractSchema(@Body() request: JsonExtractSchemaRequestDto) {
    const { text, model, jsonSchema, refine } = request;
    const extractionMethod = refine
      ? 'extractWithSchemaAndRefine'
      : 'extractWithSchema';
    try {
      const json = await this.jsonService[extractionMethod](
        model,
        text,
        jsonSchema,
      );
      const response: JsonExtractResultDto = {
        model: model.name,
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

  @ApiOperation({
    summary:
      'Return structured data from text as json using an example of input and output',
    description: `This endpoint returns structured data from input text as json.  
    It accepts a fully featured example with a given input text and a desired output json which will be used for data extraction.
    If chunking is needed, the zero-shot variant with a schema is better suited for the task.\n

    Available models: gpt-3.5-turbo, gpt-4
    `,
  })
  @ApiOkResponse({
    type: JsonExtractResultDto,
    description:
      'The text was successfully structured as json. The output is a valid json object.',
  })
  @ApiBody({
    type: JsonExtractExampleRequestDto,
    description:
      'Request body containing text to process as json and extraction parameters',
  })
  @HttpCode(200)
  @Post('example')
  async extractExample(@Body() request: JsonExtractExampleRequestDto) {
    const { text, model, exampleInput, exampleOutput } = request;
    try {
      const json = await this.jsonService.extractWithExample(model, text, {
        input: exampleInput,
        output: exampleOutput,
      });
      const response: JsonExtractResultDto = {
        model: model.name,
        refine: false,
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

  @ApiOperation({
    summary:
      'Return an analysis of potential errors from a generated json output',
    description: `This endpoint returns an analysis of a generated json output by comparing it to the original text and its json schema.  
    It accepts the json output to analyze, the original text and the json schema used for data extraction.\n

    Available models: gpt-3.5-turbo, gpt-4
    `,
  })
  @ApiOkResponse({
    type: JsonAnalyzeResultDto,
    description: 'The analysis is successfully returned.',
  })
  @ApiBody({
    type: JsonAnalyzeRequestDto,
    description:
      'Request body containing the json schema, the original text and the json output to analyze',
  })
  @HttpCode(200)
  @Post('analysis')
  async analyzeJsonOutput(@Body() request: JsonAnalyzeRequestDto) {
    const { model, jsonSchema, originalText, jsonOutput } = request;
    try {
      const analysis: Analysis = await this.jsonService.analyzeJsonOutput(
        model,
        jsonOutput,
        originalText,
        jsonSchema,
      );
      const response: JsonAnalyzeResultDto = {
        model: model.name,
        analysis,
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
