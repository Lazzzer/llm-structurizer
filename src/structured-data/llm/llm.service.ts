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
  RefinePromptsInputVariablesError,
  RefineReservedChainValuesError,
} from './exceptions/exceptions';
import { Document } from 'langchain/document';

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
      throw new LLMNotAvailableError(model);
    }

    try {
      await promptTemplate.format(chainValues);
    } catch (e) {
      throw new PromptTemplateFormatError();
    }

    const llmChain = new LLMChain({
      llm: this.availableModels.get(model),
      prompt: promptTemplate,
    });

    const output = await llmChain.call(chainValues);
    return output;
  }

  async generateRefineOutput(
    model: string,
    initialPromptTemplate: PromptTemplate,
    refinePromptTemplate: PromptTemplate,
    chainValues: ChainValues & { input_documents: Document[] },
  ) {
    if (!this.availableModels.has(model)) {
      throw new LLMNotAvailableError(model);
    }

    if (chainValues['context'] || chainValues['existing_answer']) {
      throw new RefineReservedChainValuesError('context or existing_answer');
    }

    this.throwErrorIfInputVariableMissing(
      'initialPromptTemplate',
      'context',
      initialPromptTemplate.inputVariables,
    );
    this.throwErrorIfInputVariableMissing(
      'refinePromptTemplate',
      'context',
      refinePromptTemplate.inputVariables,
    );

    this.throwErrorIfInputVariableMissing(
      'refinePromptTemplate',
      'existing_answer',
      refinePromptTemplate.inputVariables,
    );

    const refineChain = loadQARefineChain(this.availableModels.get(model), {
      questionPrompt: initialPromptTemplate,
      refinePrompt: refinePromptTemplate,
    });

    const output = await refineChain.call(chainValues);
    return output;
  }

  async splitDocument(document: string, chunkSize = 2000, chunkOverlap = 200) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });

    const output = await splitter.createDocuments([document]);
    return output;
  }

  private throwErrorIfInputVariableMissing(
    templateName: string,
    variableName: string,
    inputVariables: string[],
  ) {
    if (!inputVariables.includes(variableName)) {
      throw new RefinePromptsInputVariablesError(templateName, variableName);
    }
  }
}
