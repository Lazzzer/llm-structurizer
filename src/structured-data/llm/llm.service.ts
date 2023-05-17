import { Injectable } from '@nestjs/common';
import { PromptTemplate } from 'langchain/prompts';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BaseLanguageModel } from 'langchain/dist/base_language';
import { ChainValues } from 'langchain/dist/schema';
import { LLMChain, loadQARefineChain } from 'langchain/chains';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import {
  LLMApiKeyInvalidError,
  LLMApiKeyMissingError,
  LLMNotAvailableError,
  PromptTemplateFormatError,
  RefinePromptsInputVariablesError,
  RefineReservedChainValuesError,
} from './exceptions/exceptions';
import { Document } from 'langchain/document';
import { Model } from './types/types';

@Injectable()
export class LLMService {
  async generateOutput(
    model: Model,
    promptTemplate: PromptTemplate,
    chainValues: ChainValues,
  ) {
    const llm = this.retrieveAvailableModel(model);

    try {
      await promptTemplate.format(chainValues);
    } catch (e) {
      throw new PromptTemplateFormatError();
    }

    const llmChain = new LLMChain({
      llm,
      prompt: promptTemplate,
    });

    try {
      const output = await llmChain.call(chainValues);
      return output;
    } catch (e) {
      if (e?.response?.status && e?.response?.status === 401) {
        throw new LLMApiKeyInvalidError(model.name);
      }
      throw e;
    }
  }

  async generateRefineOutput(
    model: Model,
    initialPromptTemplate: PromptTemplate,
    refinePromptTemplate: PromptTemplate,
    chainValues: ChainValues & { input_documents: Document[] },
  ) {
    const llm = this.retrieveAvailableModel(model);

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

    const refineChain = loadQARefineChain(llm, {
      questionPrompt: initialPromptTemplate,
      refinePrompt: refinePromptTemplate,
    });

    try {
      const output = await refineChain.call(chainValues);
      return output;
    } catch (e) {
      if (e?.response?.status && e?.response?.status === 401) {
        throw new LLMApiKeyInvalidError(model.name);
      }
      throw e;
    }
  }

  async splitDocument(
    document: string,
    params?: { chunkSize: number; overlap: number },
  ) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: params?.chunkSize ?? 2000,
      chunkOverlap: params?.overlap ?? 100,
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

  private retrieveAvailableModel(model: Model): BaseLanguageModel {
    switch (model.name) {
      case 'gpt-3.5-turbo': {
        if (!model.apiKey) {
          throw new LLMApiKeyMissingError(model.name);
        }
        const llm = new ChatOpenAI({
          cache: true,
          maxConcurrency: 10,
          maxRetries: 3,
          modelName: 'gpt-3.5-turbo',
          openAIApiKey: model.apiKey,
          temperature: 0,
        });
        return llm;
      }
      case 'gpt-4': {
        if (!model.apiKey) {
          throw new LLMApiKeyMissingError(model.name);
        }
        const llm = new ChatOpenAI({
          cache: true,
          maxConcurrency: 10,
          maxRetries: 3,
          modelName: 'gpt-4',
          openAIApiKey: model.apiKey,
          temperature: 0,
        });
        return llm;
      }
      default: {
        throw new LLMNotAvailableError(model.name);
      }
    }
  }
}
