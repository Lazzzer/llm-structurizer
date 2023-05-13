import { Test, TestingModule } from '@nestjs/testing';
import { LLMService } from './llm.service';
import { ConfigModule } from '@nestjs/config';
import { PromptTemplate } from 'langchain/prompts';

describe('LLMService', () => {
  let service: LLMService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [LLMService],
    }).compile();

    service = module.get<LLMService>(LLMService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateOutput()', () => {
    it('should generate an output', async () => {
      const model = 'gpt-3.5-turbo';
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      const output = await service.generateOutput(model, promptTemplate, {
        product: 'cars',
      });
      expect(output).toBeDefined();
    });

    it('should throw if the model given is not available', async () => {
      const model = 'gpt-42';
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      await expect(
        service.generateOutput(model, promptTemplate, {
          product: 'cars',
        }),
      ).rejects.toThrow();
    });
  });
});
