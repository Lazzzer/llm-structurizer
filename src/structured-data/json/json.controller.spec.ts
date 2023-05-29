import { Test, TestingModule } from '@nestjs/testing';
import { JsonController } from './json.controller';
import { JsonService } from './json.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LLMService } from '../llm/llm.service';
import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InvalidJsonOutputError } from './exceptions/exceptions';
import { ISOLogger } from '@/logger/isoLogger.service';

describe('JsonController', () => {
  let controller: JsonController;
  let service: JsonService;
  let configService: ConfigService;
  let logger: ISOLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JsonController],
      providers: [
        JsonService,
        LLMService,
        {
          provide: ISOLogger,
          useValue: {
            debug: jest.fn(),
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            setContext: jest.fn(),
          },
        },
      ],
      imports: [ConfigModule.forRoot()],
    }).compile();

    controller = module.get<JsonController>(JsonController);
    service = module.get<JsonService>(JsonService);
    configService = module.get<ConfigService>(ConfigService);
    logger = await module.resolve<ISOLogger>(ISOLogger);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a JsonExtractResultDto from a correct data structuring request', async () => {
    const text = 'This is a text';
    const model = {
      apiKey: configService.get('OPENAI_API_KEY'),
      name: 'gpt-3.5-turbo',
    };
    const schema = '{"title": "string", "description": "string"}';
    const json = await controller.extractSchema({
      text,
      model,
      jsonSchema: schema,
    });
    expect(json).toBeDefined();
    expect(json).toMatchObject({
      model: expect.any(String),
      refine: expect.any(Boolean),
      output: expect.any(String),
    });
    expect(() => JSON.parse(json.output)).not.toThrow();
  });

  it("should call extractWitSchemaAndRefine() if the 'refine' parameter is set to true", async () => {
    const text = 'This is a text';
    const model = {
      apiKey: configService.get('OPENAI_API_KEY'),
      name: 'gpt-3.5-turbo',
    };
    const schema = '{"title": "string", "description": "string"}';
    const spy = jest.spyOn(service, 'extractWithSchemaAndRefine');
    await controller.extractSchema({
      text,
      model,
      jsonSchema: schema,
      refine: true,
    });
    expect(spy).toHaveBeenCalled();
  });

  it("should call extractWitSchemaAndRefine() if the 'refine' parameter is a correct RefineParams object", async () => {
    const text = 'This is a text';
    const model = {
      apiKey: configService.get('OPENAI_API_KEY'),
      name: 'gpt-3.5-turbo',
    };
    const schema = '{"title": "string", "description": "string"}';
    const spy = jest.spyOn(service, 'extractWithSchemaAndRefine');
    await controller.extractSchema({
      text,
      model,
      jsonSchema: schema,
      refine: {
        chunkSize: 100,
        overlap: 0,
      },
    });
    expect(spy).toHaveBeenCalled();
  });

  it('should throw a UnprocessableEntityException if the output is not a valid json', async () => {
    const text = 'This is a text';
    const model = {
      apiKey: configService.get('OPENAI_API_KEY'),
      name: 'gpt-3.5-turbo',
    };
    const schema = '{"title": "string", "description": "string"}';
    jest.spyOn(service, 'extractWithSchema').mockImplementation(async () => {
      throw new InvalidJsonOutputError();
    });
    await expect(
      controller.extractSchema({
        text,
        model,
        jsonSchema: schema,
      }),
    ).rejects.toThrow(UnprocessableEntityException);
    expect(logger.warn).toHaveBeenCalled();
  });

  it('should throw a BadRequestException if the given api key is missing', async () => {
    const text = 'This is a text';
    const model = {
      name: 'gpt-3.5-turbo',
    };
    const schema = '{"title": "string", "description": "string"}';
    await expect(
      controller.extractSchema({
        text,
        model,
        jsonSchema: schema,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(logger.warn).toHaveBeenCalled();
  });

  it('should throw a BadRequestException if the given api key is invalid', async () => {
    const text = 'This is a text';
    const model = {
      name: 'gpt-3.5-turbo',
      apiKey: 'invalid',
    };
    const schema = '{"title": "string", "description": "string"}';
    await expect(
      controller.extractSchema({
        text,
        model,
        jsonSchema: schema,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(logger.warn).toHaveBeenCalled();
  });
});
