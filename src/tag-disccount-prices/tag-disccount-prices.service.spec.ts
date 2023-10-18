import { Test, TestingModule } from '@nestjs/testing';
import { TagDisccountPricesService } from './tag-disccount-prices.service';

describe('TagDisccountPricesService', () => {
  let service: TagDisccountPricesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TagDisccountPricesService],
    }).compile();

    service = module.get<TagDisccountPricesService>(TagDisccountPricesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
