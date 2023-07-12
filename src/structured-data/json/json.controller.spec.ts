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
import { LLMBadRequestReceivedError } from '../llm/exceptions/exceptions';

describe('JsonController', () => {
  let controller: JsonController;
  let service: JsonService;
  let configService: ConfigService;
  let logger: ISOLogger;
  let model: {
    apiKey: string;
    name: string;
  };

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
    model = {
      apiKey: configService.get('OPENAI_API_KEY'),
      name: 'gpt-3.5-turbo',
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('extractSchema()', () => {
    const text = 'This is a text';
    const schema = '{"title": "string"}';

    it('should return a JsonExtractResultDto from a correct data structuring request', async () => {
      const json = await controller.extractSchema({
        text,
        model,
        jsonSchema: schema,
      });

      expect(json).toBeDefined();
      expect(json).toMatchObject({
        model: expect.any(String),
        output: expect.any(String),
      });
      expect(() => JSON.parse(json.output)).not.toThrow();
    }, 30000);

    it("should call extractWitSchemaAndRefine() if the 'refine' parameter is set to true", async () => {
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
      const refine = {
        chunkSize: 100,
        overlap: 0,
      };

      const spy = jest.spyOn(service, 'extractWithSchemaAndRefine');

      await controller.extractSchema({
        text,
        model,
        jsonSchema: schema,
        refine,
      });
      expect(spy).toHaveBeenCalled();
    });

    it('should throw a UnprocessableEntityException if the output is not a valid json', async () => {
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

    it('should throw a UnprocessableEntityException if the llm could not generate an output', async () => {
      jest.spyOn(service, 'extractWithSchema').mockImplementation(async () => {
        throw new LLMBadRequestReceivedError();
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
      const model = {
        name: 'gpt-3.5-turbo',
      };

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
      const model = {
        name: 'gpt-3.5-turbo',
        apiKey: 'invalid',
      };

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

  describe('extractExample()', () => {
    const text = 'This is a text';
    const example = {
      input: 'This is a text',
      output: '{"title": "This is a text"}',
    };

    it('should return a JsonExtractResultDto from a correct data structuring request', async () => {
      const json = await controller.extractExample({
        text,
        model,
        exampleInput: example.input,
        exampleOutput: example.output,
      });

      expect(json).toBeDefined();
      expect(json).toMatchObject({
        model: expect.any(String),
        output: expect.any(String),
      });
      expect(() => JSON.parse(json.output)).not.toThrow();
    }, 30000);

    it('should throw a UnprocessableEntityException if the output is not a valid json', async () => {
      jest.spyOn(service, 'extractWithExample').mockImplementation(async () => {
        throw new InvalidJsonOutputError();
      });

      await expect(
        controller.extractExample({
          text,
          model,
          exampleInput: example.input,
          exampleOutput: example.output,
        }),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw a UnprocessableEntityException if the llm could not generate an output', async () => {
      jest.spyOn(service, 'extractWithExample').mockImplementation(async () => {
        throw new LLMBadRequestReceivedError();
      });

      await expect(
        controller.extractExample({
          text,
          model,
          exampleInput: example.input,
          exampleOutput: example.output,
        }),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw a BadRequestException if the given api key is missing', async () => {
      const model = {
        name: 'gpt-3.5-turbo',
      };

      await expect(
        controller.extractExample({
          text,
          model,
          exampleInput: example.input,
          exampleOutput: example.output,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw a BadRequestException if the given api key is invalid', async () => {
      const model = {
        name: 'gpt-3.5-turbo',
        apiKey: 'invalid',
      };

      await expect(
        controller.extractExample({
          text,
          model,
          exampleInput: example.input,
          exampleOutput: example.output,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('analyzeJsonOutput()', () => {
    const originalText = 'This is a text';
    const schema = '{"title": "string"}';
    const output = '{"title": "This is a text"}';

    it('should return a JsonAnalyzeRequestDto from a correct request', async () => {
      const json = await controller.analyzeJsonOutput({
        model,
        jsonOutput: output,
        originalText,
        jsonSchema: schema,
      });

      expect(json).toBeDefined();
      expect(json).toMatchObject({
        model: expect.any(String),
        analysis: expect.objectContaining({
          corrections: expect.any(Array),
          textAnalysis: expect.any(String),
        }),
      });
    }, 30000);

    it('should throw a UnprocessableEntityException if the output is not a valid json', async () => {
      jest.spyOn(service, 'analyzeJsonOutput').mockImplementation(async () => {
        throw new InvalidJsonOutputError();
      });

      await expect(
        controller.analyzeJsonOutput({
          model,
          jsonOutput: output,
          originalText,
          jsonSchema: schema,
        }),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw a UnprocessableEntityException if the llm could not generate an output', async () => {
      jest.spyOn(service, 'analyzeJsonOutput').mockImplementation(async () => {
        throw new LLMBadRequestReceivedError();
      });

      await expect(
        controller.analyzeJsonOutput({
          model,
          jsonOutput: output,
          originalText,
          jsonSchema: schema,
        }),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw a BadRequestException if the given api key is missing', async () => {
      const model = {
        name: 'gpt-3.5-turbo',
      };

      await expect(
        controller.analyzeJsonOutput({
          model,
          jsonOutput: output,
          originalText,
          jsonSchema: schema,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw a BadRequestException if the given api key is invalid', async () => {
      const model = {
        name: 'gpt-3.5-turbo',
        apiKey: 'invalid',
      };

      await expect(
        controller.analyzeJsonOutput({
          model,
          jsonOutput: output,
          originalText,
          jsonSchema: schema,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('classifyText()', () => {
    const text = 'This is a text expressing a positive sentiment';
    const categories = ['positive', 'negative'];

    it('should return a JsonClassificationResultDto from a correct request', async () => {
      const json = await controller.classifyText({
        model,
        text,
        categories,
      });

      expect(json).toBeDefined();
      expect(json).toMatchObject({
        model: expect.any(String),
        classification: expect.objectContaining({
          classification: expect.any(String),
          confidence: expect.any(String),
        }),
      });
    }, 30000);

    it('should throw a UnprocessableEntityException if the output is not a valid json', async () => {
      jest.spyOn(service, 'classifyText').mockImplementation(async () => {
        throw new InvalidJsonOutputError();
      });

      await expect(
        controller.classifyText({
          model,
          text,
          categories,
        }),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw a UnprocessableEntityException if the llm could not generate an output', async () => {
      jest.spyOn(service, 'classifyText').mockImplementation(async () => {
        throw new LLMBadRequestReceivedError();
      });

      await expect(
        controller.classifyText({
          model,
          text,
          categories,
        }),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw a BadRequestException if the given api key is missing', async () => {
      const model = {
        name: 'gpt-3.5-turbo',
      };

      await expect(
        controller.classifyText({
          model,
          text,
          categories,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw a BadRequestException if the given api key is invalid', async () => {
      const model = {
        name: 'gpt-3.5-turbo',
        apiKey: 'invalid',
      };

      await expect(
        controller.classifyText({
          model,
          text,
          categories,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('createGenericOutput()', () => {
    const prompt = 'Say "Hello World"';

    it('should return a JsonGenericOutputResultDto from a correct request', async () => {
      const json = await controller.createGenericOutput({
        model,
        prompt,
      });

      expect(json).toBeDefined();
      expect(json).toMatchObject({
        model: expect.any(String),
        output: expect.any(String),
      });
    }, 30000);

    it('should throw a UnprocessableEntityException if the llm could not generate an output', async () => {
      jest
        .spyOn(service, 'handleGenericPrompt')
        .mockImplementation(async () => {
          throw new LLMBadRequestReceivedError();
        });

      await expect(
        controller.createGenericOutput({
          model,
          prompt,
        }),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw a BadRequestException if the given api key is missing', async () => {
      const model = {
        name: 'gpt-3.5-turbo',
      };

      await expect(
        controller.createGenericOutput({
          model,
          prompt,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw a BadRequestException if the given api key is invalid', async () => {
      const model = {
        name: 'gpt-3.5-turbo',
        apiKey: 'invalid',
      };

      await expect(
        controller.createGenericOutput({
          model,
          prompt,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
