import { Test, TestingModule } from '@nestjs/testing';
import { StructuringService } from './structuring.service';
import { ConfigModule } from '@nestjs/config';

describe('StructuringService', () => {
  let service: StructuringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [StructuringService],
    }).compile();

    service = module.get<StructuringService>(StructuringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
