import { Test, TestingModule } from '@nestjs/testing';
import { LLMService } from './llm.service';
import { ConfigModule } from '@nestjs/config';
import { PromptTemplate } from 'langchain/prompts';
import {
  LLMNotAvailableError,
  PromptTemplateFormatError,
} from './exceptions/exceptions';

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
      ).rejects.toThrow(LLMNotAvailableError);
    });

    it('should throw if the chain values do not match the input variables of the prompt template', async () => {
      const model = 'gpt-3.5-turbo';
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      await expect(
        service.generateOutput(model, promptTemplate, {
          wrongValue: 'cars',
        }),
      ).rejects.toThrow(PromptTemplateFormatError);
    });
  });
});
