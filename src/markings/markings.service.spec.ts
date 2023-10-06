import { Test, TestingModule } from '@nestjs/testing';
import { MarkingsService } from './markings.service';

describe('MarkingsService', () => {
  let service: MarkingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarkingsService],
    }).compile();

    service = module.get<MarkingsService>(MarkingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
