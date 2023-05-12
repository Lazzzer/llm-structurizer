import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PromptTemplate } from 'langchain/prompts';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BaseLanguageModel } from 'langchain/dist/base_language';
import { ChainValues } from 'langchain/dist/schema';
import { LLMChain, loadQARefineChain } from 'langchain/chains';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

@Injectable()
export class LLMService {
  constructor(private configService: ConfigService) {}

  private gpt3_5 = new ChatOpenAI({
    cache: true,
    maxConcurrency: 10,
    maxRetries: 3,
    modelName: 'gpt-3.5-turbo',
    openAIApiKey: this.configService.get<string>('openaiApiKey'),
    temperature: 0,
  });

  private gpt4 = new ChatOpenAI({
    cache: true,
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

  async generateOutput(
    model: string,
    promptTemplate: PromptTemplate,
    chainValues: ChainValues,
  ) {
    if (!this.availableModels.has(model)) {
      throw new Error(`Model ${model} is not available.`);
    }

    const llmChain = new LLMChain({
      llm: this.availableModels.get(model),
      prompt: promptTemplate,
    });

    const output = await llmChain.predict(chainValues);
    return output;
  }

  async generateRefineOutput(
    model: string,
    initialPromptTemplate: PromptTemplate,
    refinePromptTemplate: PromptTemplate,
    chainValues: ChainValues,
  ) {
    if (!this.availableModels.has(model)) {
      throw new Error(`Model ${model} is not available.`);
    }

    const refineChain = loadQARefineChain(this.availableModels.get(model), {
      questionPrompt: initialPromptTemplate,
      refinePrompt: refinePromptTemplate,
      verbose: true,
    });

    const output = await refineChain.run(chainValues);
    return output;
  }

  private async splitDocument(document: string) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200,
    });

    const output = await splitter.createDocuments([document]);
    return output;
  }
}
