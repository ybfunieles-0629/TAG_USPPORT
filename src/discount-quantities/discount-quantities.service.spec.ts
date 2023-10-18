import { Test, TestingModule } from '@nestjs/testing';
import { DiscountQuantitiesService } from './discount-quantities.service';

describe('DiscountQuantitiesService', () => {
  let service: DiscountQuantitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountQuantitiesService],
    }).compile();

    service = module.get<DiscountQuantitiesService>(DiscountQuantitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
