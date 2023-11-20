import { Test, TestingModule } from '@nestjs/testing';
import { OrderListDetailsController } from './order-list-details.controller';
import { OrderListDetailsService } from './order-list-details.service';

describe('OrderListDetailsController', () => {
  let controller: OrderListDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderListDetailsController],
      providers: [OrderListDetailsService],
    }).compile();

    controller = module.get<OrderListDetailsController>(OrderListDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
