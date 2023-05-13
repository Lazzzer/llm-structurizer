import { Injectable } from '@nestjs/common';
import { LLMService } from '../llm/llm.service';

@Injectable()
export class JsonService {
  constructor(private llmService: LLMService) {}
}
