import { Test, TestingModule } from '@nestjs/testing';
import { DiscountQuantitiesController } from './discount-quantities.controller';
import { DiscountQuantitiesService } from './discount-quantities.service';

describe('DiscountQuantitiesController', () => {
  let controller: DiscountQuantitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountQuantitiesController],
      providers: [DiscountQuantitiesService],
    }).compile();

    controller = module.get<DiscountQuantitiesController>(DiscountQuantitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
