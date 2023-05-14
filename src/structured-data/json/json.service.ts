import { Injectable } from '@nestjs/common';
import { LLMService } from '../llm/llm.service';
import {
  jsonOneShotExtraction,
  jsonZeroShotSchemaExtraction,
  jsonZeroShotSchemaExtractionRefine,
} from './prompts';
import { InvalidJsonOutputError } from './exceptions/exceptions';

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
      const json: object = JSON.parse(output.text);
      return json;
    } catch (e) {
      throw new InvalidJsonOutputError();
    }
  }
}
