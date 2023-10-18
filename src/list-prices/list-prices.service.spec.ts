import { Test, TestingModule } from '@nestjs/testing';
import { ListPricesService } from './list-prices.service';

describe('ListPricesService', () => {
  let service: ListPricesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListPricesService],
    }).compile();

    service = module.get<ListPricesService>(ListPricesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
