import { Injectable } from '@nestjs/common';
import { LLMService } from '../llm/llm.service';
import {
  jsonAnalysis,
  jsonOneShotExtraction,
  jsonZeroShotSchemaExtraction,
  jsonZeroShotSchemaExtractionRefine,
} from './prompts';
import { InvalidJsonOutputError } from './exceptions/exceptions';
import { Analysis } from './dto/jsonAnalyzeResult.dto';
import { Model } from '../llm/types/types';
import { RefineParams } from './types/types';

@Injectable()
export class JsonService {
  private defaultRefineParams: RefineParams = {
    chunkSize: 2000,
    overlap: 100,
  };

  constructor(private llmService: LLMService) {}

  async extractWithSchema(model: Model, text: string, schema: string) {
    const output = await this.llmService.generateOutput(
      model,
      jsonZeroShotSchemaExtraction,
      {
        context: text,
        jsonSchema: schema,
      },
    );
    try {
      const json: object = JSON.parse(output.text);
      return json;
    } catch (e) {
      throw new InvalidJsonOutputError();
    }
  }

  async extractWithSchemaAndRefine(
    model: Model,
    text: string,
    schema: string,
    refineParams?: RefineParams,
  ) {
    const params = refineParams || this.defaultRefineParams;
    const documents = await this.llmService.splitDocument(text, params);
    const { output, llmCallCount } = await this.llmService.generateRefineOutput(
      model,
      jsonZeroShotSchemaExtraction,
      jsonZeroShotSchemaExtractionRefine,
      {
        input_documents: documents,
        jsonSchema: schema,
      },
    );
    try {
      const json: object = JSON.parse(output.output_text);
      return { json, refineRecap: { ...params, llmCallCount } };
    } catch (e) {
      throw new InvalidJsonOutputError();
    }
  }

  async extractWithExample(
    model: Model,
    text: string,
    example: { input: string; output: string },
  ) {
    const output = await this.llmService.generateOutput(
      model,
      jsonOneShotExtraction,
      {
        context: text,
        exampleInput: example.input,
        exampleOutput: example.output,
      },
    );
    try {
      const json = JSON.parse(output.text);
      return json;
    } catch (e) {
      throw new InvalidJsonOutputError();
    }
  }

  async analyzeJsonOutput(
    model: Model,
    jsonOutput: string,
    originalText: string,
    schema: string,
  ) {
    const outputFormat: Analysis = {
      corrections: [
        {
          field: 'the field in the generated JSON that needs to be corrected',
          issue: 'the issue you identified',
          description:
            'your description of the issue, give your full reasoning for why it is an issue',
          suggestion: 'your suggestion for correction',
        },
      ],
    };

    const output = await this.llmService.generateOutput(model, jsonAnalysis, {
      jsonSchema: schema,
      originalText,
      jsonOutput,
      outputFormat: JSON.stringify(outputFormat),
    });
    try {
      const json: Analysis = JSON.parse(output.text);
      if (
        Array.isArray(json.corrections) &&
        json.corrections.every(
          (correction) =>
            typeof correction.field === 'string' &&
            typeof correction.issue === 'string' &&
            typeof correction.description === 'string' &&
            typeof correction.suggestion === 'string',
        )
      ) {
        return json;
      } else {
        throw new InvalidJsonOutputError();
      }
    } catch (e) {
      throw new InvalidJsonOutputError();
    }
  }
}
