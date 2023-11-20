import { Test, TestingModule } from '@nestjs/testing';
import { OrderRatingsService } from './order-ratings.service';

describe('OrderRatingsService', () => {
  let service: OrderRatingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderRatingsService],
    }).compile();

    service = module.get<OrderRatingsService>(OrderRatingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
