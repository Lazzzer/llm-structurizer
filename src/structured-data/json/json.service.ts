import { Injectable } from '@nestjs/common';
import { LLMService } from '../llm/llm.service';
import {
  jsonAnalysis,
  jsonOneShotExtraction,
  jsonZeroShotSchemaExtraction,
  jsonZeroShotSchemaExtractionRefine,
} from './prompts';
import { InvalidJsonOutputError } from './exceptions/exceptions';
import type { Analysis } from './type/types';

@Injectable()
export class JsonService {
  constructor(private llmService: LLMService) {}

  async extractWithSchema(text: string, model: string, schema: string) {
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
    text: string,
    model: string,
    schema: string,
  ) {
    const documents = await this.llmService.splitDocument(text);
    const output = await this.llmService.generateRefineOutput(
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
      return json;
    } catch (e) {
      throw new InvalidJsonOutputError();
    }
  }

  async extractWithExample(
    text: string,
    model: string,
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

  async analyzeJsonOutput(
    model: string,
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
            'your description of the issue, give your reasoning for why it is an issue',
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
      const json: object = JSON.parse(output.text);
      return json;
    } catch (e) {
      throw new InvalidJsonOutputError();
    }
  }
}
