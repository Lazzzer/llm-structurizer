import { Test, TestingModule } from '@nestjs/testing';
import { JsonController } from './json.controller';
import { JsonService } from './json.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LLMService } from '../llm/llm.service';
import { UnprocessableEntityException } from '@nestjs/common';
import { InvalidJsonOutputError } from './exceptions/exceptions';

describe('JsonController', () => {
  let controller: JsonController;
  let service: JsonService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JsonController],
      providers: [JsonService, LLMService],
      imports: [ConfigModule.forRoot()],
    }).compile();

    controller = module.get<JsonController>(JsonController);
    service = module.get<JsonService>(JsonService);
    configService = module.get<ConfigService>(ConfigService);
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
  });
});
