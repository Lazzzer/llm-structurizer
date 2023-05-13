import { Module } from '@nestjs/common';
import { LLMService } from './llm/llm.service';

@Module({})
export class StructuredDataModule {
  providers: [LLMService];
}
