import { Test, TestingModule } from '@nestjs/testing';
import { JsonService } from './json.service';
import { LLMService } from '../llm/llm.service';

describe('JsonService', () => {
  let service: JsonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsonService, LLMService],
    }).compile();

    service = module.get<JsonService>(JsonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
