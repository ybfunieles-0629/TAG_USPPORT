import { Test, TestingModule } from '@nestjs/testing';
import { OrderRatingsController } from './order-ratings.controller';
import { OrderRatingsService } from './order-ratings.service';

describe('OrderRatingsController', () => {
  let controller: OrderRatingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderRatingsController],
      providers: [OrderRatingsService],
    }).compile();

    controller = module.get<OrderRatingsController>(OrderRatingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
