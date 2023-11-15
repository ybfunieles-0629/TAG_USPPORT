import { Test, TestingModule } from '@nestjs/testing';
import { FinancingCostProfitsService } from './financing-cost-profits.service';

describe('FinancingCostProfitsService', () => {
  let service: FinancingCostProfitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinancingCostProfitsService],
    }).compile();

    service = module.get<FinancingCostProfitsService>(FinancingCostProfitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
