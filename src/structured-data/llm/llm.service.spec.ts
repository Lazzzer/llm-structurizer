import { Test, TestingModule } from '@nestjs/testing';
import { LLMService } from './llm.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PromptTemplate } from 'langchain/prompts';
import {
  LLMApiKeyInvalidError,
  LLMApiKeyMissingError,
  LLMNotAvailableError,
  PromptTemplateFormatError,
} from './exceptions/exceptions';

describe('LLMService', () => {
  let service: LLMService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [LLMService],
    }).compile();

    service = module.get<LLMService>(LLMService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateOutput()', () => {
    it('should generate an output', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      const output = await service.generateOutput(model, promptTemplate, {
        product: 'cars',
      });
      expect(output).toBeDefined();
    }, 10000);

    it('should throw if the given model is not available', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-42',
      };
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

    it('should throw if the given model needs a missing api key', async () => {
      const model = {
        name: 'gpt-3.5-turbo',
      };
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      await expect(
        service.generateOutput(model, promptTemplate, {
          product: 'cars',
        }),
      ).rejects.toThrow(LLMApiKeyMissingError);
    });

    it('should throw if the given api key is invalid', async () => {
      const model = {
        apiKey: 'invalid',
        name: 'gpt-3.5-turbo',
      };
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      await expect(
        service.generateOutput(model, promptTemplate, {
          product: 'cars',
        }),
      ).rejects.toThrow(LLMApiKeyInvalidError);
    });

    it('should throw if the chain values do not match the input variables of the prompt template', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
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
  describe('generateRefineOutput()', () => {
    it('should generate the correct output from a chunked document', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const text = `
        This is the first sentence of the testing text.\n
        This is the second sentence of the testing text. It contains the tagged value to output: llm-structurizer
        `;
      const documents = await service.splitDocument(text, {
        chunkSize: 100,
        overlap: 0,
      });
      const initialPromptTemplate = new PromptTemplate({
        template: `Given the following text, please write the value to output.
        ---------------------
        {context}
        ---------------------
        Output:
        `,
        inputVariables: ['context'],
      });

      const refinePromptTemplate = new PromptTemplate({
        template: `
        Given the following text, please only write the tagged value to output.
        ---------------------
        You have provided an existing output: 
        {existing_answer}

        We have the opportunity to refine the existing output (only if needed) with some more context below.
        ---------------------
        Context:
        {context}
        ---------------------
        Given the new context, refine the original output to give a better answer. 
        If the context isn't useful, return the existing output.
        `,
        inputVariables: ['existing_answer', 'context'],
      });

      const { output, llmCallCount } = await service.generateRefineOutput(
        model,
        initialPromptTemplate,
        refinePromptTemplate,
        {
          input_documents: documents,
        },
      );

      expect(output).toBeDefined();
      expect(output['output_text']).toContain('llm-structurizer');
      expect(llmCallCount).toBe(2);
    }, 20000);

    it('should throw if the model given is not available', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-42',
      };
      const dummyPrompt = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      await expect(
        service.generateRefineOutput(model, dummyPrompt, dummyPrompt, {
          input_documents: [],
        }),
      ).rejects.toThrow(LLMNotAvailableError);
    });

    it('should throw if there are reserved input variables in chainValues', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const dummyPrompt = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      await expect(
        service.generateRefineOutput(model, dummyPrompt, dummyPrompt, {
          context: 'Not allowed',
          input_documents: [],
        }),
      ).rejects.toThrow(
        `Reserved chain value context or existing_answer cannot be used as an input variable.`,
      );
    });

    it('should throw if the initial prompt template does not have the context input variable', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const initialPromptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      await expect(
        service.generateRefineOutput(
          model,
          initialPromptTemplate,
          initialPromptTemplate,
          {
            input_documents: [],
          },
        ),
      ).rejects.toThrow(
        'initialPromptTemplate is missing mandatory input variable: context.',
      );
    });

    it('should throw if the refine prompt template does not have the context input variable', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const initialPromptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {context}?',
        inputVariables: ['context'],
      });

      const refinePromptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      await expect(
        service.generateRefineOutput(
          model,
          initialPromptTemplate,
          refinePromptTemplate,
          {
            input_documents: [],
          },
        ),
      ).rejects.toThrow(
        'refinePromptTemplate is missing mandatory input variable: context.',
      );
    });

    it('should throw if the refine prompt template does not have the existing_answer input variable', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const initialPromptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {context}?',
        inputVariables: ['context'],
      });

      const refinePromptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {context}?',
        inputVariables: ['context'],
      });

      await expect(
        service.generateRefineOutput(
          model,
          initialPromptTemplate,
          refinePromptTemplate,
          {
            input_documents: [],
          },
        ),
      ).rejects.toThrow(
        'refinePromptTemplate is missing mandatory input variable: existing_answer.',
      );
    });
  });
});
