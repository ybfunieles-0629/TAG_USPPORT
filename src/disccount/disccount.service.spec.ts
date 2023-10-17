import { Test, TestingModule } from '@nestjs/testing';
import { DisccountService } from './disccount.service';

describe('DisccountService', () => {
  let service: DisccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisccountService],
    }).compile();

    service = module.get<DisccountService>(DisccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
