import {
  BadRequestException,
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
import { JsonAnalyzeResultDto } from './dto/jsonAnalyzeResult.dto';
import {
  LLMApiKeyInvalidError,
  LLMApiKeyMissingError,
  LLMBadRequestReceivedError,
} from '../llm/exceptions/exceptions';

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
    const { text, model, debug, jsonSchema, refine } = request;
    try {
      if (refine) {
        const { json, refineRecap, debugReport } =
          await this.jsonService.extractWithSchemaAndRefine(
            model,
            debug,
            text,
            jsonSchema,
            typeof refine === 'object' ? refine : undefined,
          );
        const response: JsonExtractResultDto = {
          model: model.name,
          refine: refineRecap,
          output: JSON.stringify(json),
          debug: debug ? debugReport : undefined,
        };
        return response;
      } else {
        const { json, debugReport } = await this.jsonService.extractWithSchema(
          model,
          debug,
          text,
          jsonSchema,
        );
        const response: JsonExtractResultDto = {
          model: model.name,
          refine: false,
          output: JSON.stringify(json),
          debug: debug ? debugReport : undefined,
        };
        return response;
      }
    } catch (e) {
      if (
        e instanceof InvalidJsonOutputError ||
        e instanceof LLMBadRequestReceivedError
      ) {
        throw new UnprocessableEntityException(e.message);
      }
      if (
        e instanceof LLMApiKeyMissingError ||
        e instanceof LLMApiKeyInvalidError
      ) {
        throw new BadRequestException(e.message);
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
    const { text, model, debug, exampleInput, exampleOutput } = request;
    try {
      const { json, debugReport } = await this.jsonService.extractWithExample(
        model,
        debug,
        text,
        {
          input: exampleInput,
          output: exampleOutput,
        },
      );
      const response: JsonExtractResultDto = {
        model: model.name,
        refine: false,
        output: JSON.stringify(json),
        debug: debug ? debugReport : undefined,
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
    const { model, debug, jsonSchema, originalText, jsonOutput } = request;
    try {
      const { json: analysis, debugReport } =
        await this.jsonService.analyzeJsonOutput(
          model,
          debug,
          jsonOutput,
          originalText,
          jsonSchema,
        );
      const response: JsonAnalyzeResultDto = {
        model: model.name,
        analysis,
        debug: debugReport ? debugReport : undefined,
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
