import { Test, TestingModule } from '@nestjs/testing';
import { FinancingCostProfitsController } from './financing-cost-profits.controller';
import { FinancingCostProfitsService } from './financing-cost-profits.service';

describe('FinancingCostProfitsController', () => {
  let controller: FinancingCostProfitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinancingCostProfitsController],
      providers: [FinancingCostProfitsService],
    }).compile();

    controller = module.get<FinancingCostProfitsController>(FinancingCostProfitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
