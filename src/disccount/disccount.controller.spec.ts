import { Test, TestingModule } from '@nestjs/testing';
import { DisccountController } from './disccount.controller';
import { DisccountService } from './disccount.service';

describe('DisccountController', () => {
  let controller: DisccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisccountController],
      providers: [DisccountService],
    }).compile();

    controller = module.get<DisccountController>(DisccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
