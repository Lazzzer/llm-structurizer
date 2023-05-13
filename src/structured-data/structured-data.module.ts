import { Module } from '@nestjs/common';
import { LLMService } from './llm/llm.service';
import { JsonService } from './json/json.service';
import { JsonController } from './json/json.controller';

@Module({
  controllers: [JsonController],
  providers: [LLMService, JsonService],
})
export class StructuredDataModule {}
