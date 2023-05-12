import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PromptTemplate } from 'langchain/prompts';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BaseLanguageModel } from 'langchain/dist/base_language';
import { ChainValues } from 'langchain/dist/schema';
import { LLMChain } from 'langchain/chains';

@Injectable()
export class StructuringService {
  constructor(private configService: ConfigService) {}

  private gpt3_5 = new ChatOpenAI({
    maxConcurrency: 10,
    maxRetries: 3,
    modelName: 'gpt-3.5-turbo',
    openAIApiKey: this.configService.get<string>('openaiApiKey'),
    temperature: 0,
  });

  private gpt4 = new ChatOpenAI({
    maxConcurrency: 10,
    maxRetries: 3,
    modelName: 'gpt-4',
    openAIApiKey: this.configService.get<string>('openaiApiKey'),
    temperature: 0,
  });

  private availableModels = new Map<string, BaseLanguageModel>([
    ['gpt-3.5-turbo', this.gpt3_5],
    ['gpt-4', this.gpt4],
  ]);

  async extractStructuredData(
    model: string,
    promptTemplate: PromptTemplate,
    chainValues: ChainValues,
  ) {
    if (!this.availableModels.has(model)) {
      throw new Error(
        `Model ${model} is not available for structured data extraction.`,
      );
    }

    const llmChain = new LLMChain({
      llm: this.availableModels.get(model),
      prompt: promptTemplate,
    });

    const structuredText = await llmChain.run(chainValues);
    return structuredText;
  }
}
