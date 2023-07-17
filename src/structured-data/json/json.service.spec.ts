import { Test, TestingModule } from '@nestjs/testing';
import { JsonService } from './json.service';
import { LLMService } from '../llm/llm.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InvalidJsonOutputError } from './exceptions/exceptions';
import { ISOLogger } from '@/logger/isoLogger.service';

jest.retryTimes(3);

describe('JsonService', () => {
  let service: JsonService;
  let llmService: LLMService;
  let configService: ConfigService;
  let logger: ISOLogger;
  let model: {
    apiKey: string;
    name: string;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
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
    }).compile();

    service = module.get<JsonService>(JsonService);
    llmService = module.get<LLMService>(LLMService);
    configService = module.get<ConfigService>(ConfigService);
    logger = await module.resolve<ISOLogger>(ISOLogger);

    model = {
      apiKey: configService.get('OPENAI_API_KEY'),
      name: 'gpt-3.5-turbo',
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractWithSchema()', () => {
    const text = 'This is a text';
    const schema = '{"title": "string"}';

    it('should return a json object', async () => {
      const { json } = await service.extractWithSchema(model, text, schema);

      expect(json).toBeDefined();
      expect(json).toHaveProperty('title');
    }, 30000);

    it('should throw an error if the output is not a valid json', async () => {
      jest.spyOn(llmService, 'generateOutput').mockResolvedValue({
        output: {
          text: '{"title": "string"',
        },
        debugReport: null,
      });

      await expect(
        service.extractWithSchema(model, text, schema),
      ).rejects.toThrow(InvalidJsonOutputError);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('extractWithExample()', () => {
    const text = 'This is a text';
    const example = {
      input: 'This is a text',
      output: '{"title": "This is a text"}',
    };

    it('should return a json object', async () => {
      const { json } = await service.extractWithExample(model, text, example);

      expect(json).toBeDefined();
      expect(json).toHaveProperty('title');
    }, 30000);

    it('should throw an error if the output is not a valid json', async () => {
      jest.spyOn(llmService, 'generateOutput').mockResolvedValue({
        output: {
          text: '{"title": "This is a text"',
        },
        debugReport: null,
      });

      await expect(
        service.extractWithExample(model, text, example),
      ).rejects.toThrow(InvalidJsonOutputError);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('analyzeJsonOutput()', () => {
    const originalText = 'This is a text';
    const jsonOutput = {
      title: 'This is a text',
    };
    const schema = '{"title": "string"}';

    it('should return an Analysis object', async () => {
      const { json: analysis } = await service.analyzeJsonOutput(
        model,
        JSON.stringify(jsonOutput),
        originalText,
        schema,
      );

      expect(analysis).toBeDefined();
      expect(analysis).toHaveProperty('corrections');
      expect(analysis).toHaveProperty('textAnalysis');
    }, 30000);

    it('should throw if the output is not a valid Analysis object', async () => {
      jest.spyOn(llmService, 'generateOutput').mockResolvedValue({
        output: {
          text: 'bad output',
        },
        debugReport: null,
      });

      await expect(
        service.analyzeJsonOutput(
          model,
          JSON.stringify(jsonOutput),
          originalText,
          schema,
        ),
      ).rejects.toThrow(InvalidJsonOutputError);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('classifyText()', () => {
    const text = 'This is a text expressing a positive sentiment';
    const categories = ['positive', 'negative'];

    it('should return a Classification object', async () => {
      const { json: classification } = await service.classifyText(
        model,
        text,
        categories,
      );

      expect(classification).toBeDefined();
      expect(classification).toHaveProperty('classification');
      expect(classification).toHaveProperty('confidence');
      expect(classification.classification).toBe('positive');
    }, 30000);

    it('should return a Classification object with other as value', async () => {
      const text =
        'This is a text expressing neither a positive sentiment nor a negative one';

      const { json: classification } = await service.classifyText(
        model,
        text,
        categories,
      );

      expect(classification).toBeDefined();
      expect(classification).toHaveProperty('classification');
      expect(classification).toHaveProperty('confidence');
      expect(classification.classification).toBe('other');
    }, 30000);

    it('should throw if the output is not a valid Classification object', async () => {
      jest.spyOn(llmService, 'generateOutput').mockResolvedValue({
        output: {
          text: 'bad output',
        },
        debugReport: null,
      });

      await expect(
        service.classifyText(model, text, categories),
      ).rejects.toThrow(InvalidJsonOutputError);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('handleGenericPrompt()', () => {
    it('should return an output with the result of the generic prompt', async () => {
      const outputFormat = {
        sentence: 'string',
      };
      const jsonOutputPrompt = `You are an helpful assistant. Your only task is to say "Hello World" to the user.

        Please ALWAYS provide your output in the following format as a JSON object:

        ${JSON.stringify(outputFormat)}

        Your output:
        `;
      const textOutputPrompt = 'Say "Hello World"';

      const { json: jsonOutput } = await service.handleGenericPrompt(
        model,
        jsonOutputPrompt,
      );
      const { json: textOutput } = await service.handleGenericPrompt(
        model,
        textOutputPrompt,
      );

      expect(jsonOutput).toBeDefined();
      expect(jsonOutput).toHaveProperty('output');
      expect(jsonOutput.output).toBe('{"sentence":"Hello World"}');
      expect(textOutput).toBeDefined();
      expect(textOutput).toHaveProperty('output');
      expect(textOutput.output).toBe('Hello World');
    }, 30000);
  });
});
