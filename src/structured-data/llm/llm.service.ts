import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PromptTemplate } from 'langchain/prompts';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BaseLanguageModel } from 'langchain/dist/base_language';
import { ChainValues } from 'langchain/dist/schema';
import { LLMChain, loadQARefineChain } from 'langchain/chains';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import {
  LLMNotAvailableError,
  PromptTemplateFormatError,
} from './exceptions/exceptions';

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
    await this.checkInputs(model, [promptTemplate], chainValues);

    const llmChain = new LLMChain({
      llm: this.availableModels.get(model),
      prompt: promptTemplate,
      verbose: true,
    });

    const output = await llmChain.call(chainValues);
    return output;
  }

  async generateRefineOutput(
    model: string,
    initialPromptTemplate: PromptTemplate,
    refinePromptTemplate: PromptTemplate,
    chainValues: ChainValues,
  ) {
    await this.checkInputs(
      model,
      [initialPromptTemplate, refinePromptTemplate],
      chainValues,
    );

    const refineChain = loadQARefineChain(this.availableModels.get(model), {
      questionPrompt: initialPromptTemplate,
      refinePrompt: refinePromptTemplate,
      verbose: true,
    });

    const output = await refineChain.call(chainValues);
    return output;
  }

  private async splitDocument(
    document: string,
    chunkSize = 2000,
    chunkOverlap = 200,
  ) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });

    const output = await splitter.createDocuments([document]);
    return output;
  }

  private async checkInputs(
    model: string,
    promptTemplates: PromptTemplate[],
    chainValues: ChainValues,
  ) {
    if (!this.availableModels.has(model)) {
      throw new LLMNotAvailableError(model);
    }

    try {
      for (const promptTemplate of promptTemplates) {
        await promptTemplate.format(chainValues);
      }
    } catch (e) {
      throw new PromptTemplateFormatError();
    }
  }
}
