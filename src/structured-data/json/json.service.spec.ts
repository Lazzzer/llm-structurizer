import { Test, TestingModule } from '@nestjs/testing';
import { JsonService } from './json.service';
import { LLMService } from '../llm/llm.service';
import { ConfigModule } from '@nestjs/config';
import { InvalidJsonOutputError } from './exceptions/exceptions';

describe('JsonService', () => {
  let service: JsonService;
  let llmService: LLMService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [JsonService, LLMService],
    }).compile();

    service = module.get<JsonService>(JsonService);
    llmService = module.get<LLMService>(LLMService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractWithSchema()', () => {
    it('should return a json object', async () => {
      const text = 'This is a text';
      const model = 'gpt-3.5-turbo';
      const schema = '{"title": "string", "description": "string"}';
      const json = await service.extractWithSchema(text, model, schema);
      expect(json).toBeDefined();
      expect(json).toHaveProperty('title');
      expect(json).toHaveProperty('description');
    });
    it('should throw an error if the output is not a valid json', async () => {
      const text = 'This is a text';
      const model = 'gpt-3.5-turbo';
      const schema = '{"title": "string", "description": "string"';
      jest.spyOn(llmService, 'generateOutput').mockResolvedValue({
        text: '{"title": "string", "description": "string"',
      });
      await expect(
        service.extractWithSchema(text, model, schema),
      ).rejects.toThrow(InvalidJsonOutputError);
    });
  });
  describe('extractWithExample()', () => {
    it('should return a json object', async () => {
      const text = 'This is a text';
      const model = 'gpt-3.5-turbo';
      const example = {
        input: 'This is a text',
        output: '{"title": "string", "description": "string"}',
      };
      const json = await service.extractWithExample(text, model, example);
      expect(json).toBeDefined();
      expect(json).toHaveProperty('title');
      expect(json).toHaveProperty('description');
    });
    it('should throw an error if the output is not a valid json', async () => {
      const text = 'This is a text';
      const model = 'gpt-3.5-turbo';
      const example = {
        input: 'This is a text',
        output: '{"title": "string", "description": "string"',
      };
      jest.spyOn(llmService, 'generateOutput').mockResolvedValue({
        text: '{"title": "string", "description": "string"',
      });
      await expect(
        service.extractWithExample(text, model, example),
      ).rejects.toThrow(InvalidJsonOutputError);
    });
  });
});
