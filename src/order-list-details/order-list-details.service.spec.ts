import { Test, TestingModule } from '@nestjs/testing';
import { OrderListDetailsService } from './order-list-details.service';

describe('OrderListDetailsService', () => {
  let service: OrderListDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderListDetailsService],
    }).compile();

    service = module.get<OrderListDetailsService>(OrderListDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
