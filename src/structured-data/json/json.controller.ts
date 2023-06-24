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
import { ISOLogger } from '@/logger/isoLogger.service';
import { JsonClassificationResultDto } from './dto/jsonClassificationResult.dto';
import { JsonClassificationRequestDto } from './dto/jsonClassificationRequest.dto';

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
  constructor(
    private readonly jsonService: JsonService,
    private logger: ISOLogger,
  ) {
    this.logger.setContext(JsonController.name);
  }

  @ApiOperation({
    summary: 'Return structured data from text as json using a json schema',
    description: `This endpoint returns structured data from input text as json.  
    It accepts a json schema as model for data extraction. The Refine technique can be used for longer texts.\n

    Available models: gpt-3.5-turbo, gpt-3.5-turbo-16k, gpt-4
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
        this.logger.debug('refine is true');
        const { json, refineRecap, debugReport } =
          await this.jsonService.extractWithSchemaAndRefine(
            model,
            text,
            jsonSchema,
            typeof refine === 'object' ? refine : undefined,
            debug,
          );
        const response: JsonExtractResultDto = {
          model: model.name,
          refine: refineRecap,
          output: JSON.stringify(json),
          debug: debug ? debugReport : undefined,
        };
        this.logger.debug('Request processed successfully');
        return response;
      } else {
        const { json, debugReport } = await this.jsonService.extractWithSchema(
          model,
          text,
          jsonSchema,
          debug,
        );
        const response: JsonExtractResultDto = {
          model: model.name,
          refine: false,
          output: JSON.stringify(json),
          debug: debug ? debugReport : undefined,
        };
        this.logger.debug(
          'Request for json extraction with schema processed successfully',
        );
        return response;
      }
    } catch (e) {
      if (
        e instanceof InvalidJsonOutputError ||
        e instanceof LLMBadRequestReceivedError
      ) {
        this.logger.warn('UnprocessableEntityException thrown');
        throw new UnprocessableEntityException(e.message);
      }
      if (
        e instanceof LLMApiKeyMissingError ||
        e instanceof LLMApiKeyInvalidError
      ) {
        this.logger.warn('BadRequestException thrown');
        throw new BadRequestException(e.message);
      }
      this.logger.error('InternalServerErrorException thrown');
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({
    summary:
      'Return structured data from text as json using an example of input and output',
    description: `This endpoint returns structured data from input text as json.  
    It accepts a fully featured example with a given input text and a desired output json which will be used for data extraction.
    If chunking is needed, the zero-shot variant with a schema is better suited for the task.\n

    Available models: gpt-3.5-turbo, gpt-3.5-turbo-16k, gpt-4
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
        text,
        {
          input: exampleInput,
          output: exampleOutput,
        },
        debug,
      );
      const response: JsonExtractResultDto = {
        model: model.name,
        refine: false,
        output: JSON.stringify(json),
        debug: debug ? debugReport : undefined,
      };
      this.logger.debug(
        'Request for json extraction with example processed successfully',
      );
      return response;
    } catch (e) {
      if (e instanceof InvalidJsonOutputError) {
        this.logger.warn(
          `UnprocessableEntityException thrown due to error : ${e.name}`,
        );
        throw new UnprocessableEntityException(e.message);
      }
      this.logger.error('InternalServerErrorException thrown');
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({
    summary:
      'Return an analysis of potential errors from a generated json output',
    description: `This endpoint returns an analysis of a generated json output by comparing it to the original text and its json schema.  
    It accepts the json output to analyze, the original text and the json schema used for data extraction.\n

    Available models: gpt-3.5-turbo, gpt-3.5-turbo-16k, gpt-4
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
          jsonOutput,
          originalText,
          jsonSchema,
          debug,
        );
      const response: JsonAnalyzeResultDto = {
        model: model.name,
        analysis,
        debug: debugReport ? debugReport : undefined,
      };
      this.logger.debug('Request for analysis processed successfully');
      return response;
    } catch (e) {
      if (e instanceof InvalidJsonOutputError) {
        this.logger.warn('UnprocessableEntityException thrown');
        throw new UnprocessableEntityException(e.message);
      }
      this.logger.error('InternalServerErrorException thrown');
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({
    summary:
      'Return a classification of the given text from a list of possible categories',
    description: `This endpoint returns a classification of a text from a list of possible categories. 
    It accepts the text to classify and a list of categories with their descriptions.\n

    Available models: gpt-3.5-turbo, gpt-3.5-turbo-16k, gpt-4
    `,
  })
  @ApiOkResponse({
    type: JsonClassificationResultDto,
    description: 'The classification is successfully returned.',
  })
  @ApiBody({
    type: JsonClassificationRequestDto,
    description:
      'Request body containing the text to classify and a list of categories with their descriptions',
  })
  @HttpCode(200)
  @Post('classification')
  async classifyText(@Body() request: JsonClassificationRequestDto) {
    const { model, categories, debug, text } = request;
    try {
      const { json: classification, debugReport } =
        await this.jsonService.classifyText(model, text, categories, debug);
      const response: JsonClassificationResultDto = {
        model: model.name,
        classification,
        debug: debugReport ? debugReport : undefined,
      };
      this.logger.debug('Request for classification processed successfully');
      return response;
    } catch (e) {
      if (e instanceof InvalidJsonOutputError) {
        this.logger.warn('UnprocessableEntityException thrown');
        throw new UnprocessableEntityException(e.message);
      }
      this.logger.error('InternalServerErrorException thrown');
      throw new InternalServerErrorException(e.message);
    }
  }
}
