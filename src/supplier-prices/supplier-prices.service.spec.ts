import { Test, TestingModule } from '@nestjs/testing';
import { SupplierPricesService } from './supplier-prices.service';

describe('SupplierPricesService', () => {
  let service: SupplierPricesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupplierPricesService],
    }).compile();

    service = module.get<SupplierPricesService>(SupplierPricesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
