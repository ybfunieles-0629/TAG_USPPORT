import { Test, TestingModule } from '@nestjs/testing';
import { DisccountsService } from './disccounts.service';

describe('DisccountsService', () => {
  let service: DisccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisccountsService],
    }).compile();

    service = module.get<DisccountsService>(DisccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
