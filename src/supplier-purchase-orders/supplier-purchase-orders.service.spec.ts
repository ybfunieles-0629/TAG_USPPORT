import { Test, TestingModule } from '@nestjs/testing';
import { SupplierPurchaseOrdersService } from './supplier-purchase-orders.service';

describe('SupplierPurchaseOrdersService', () => {
  let service: SupplierPurchaseOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupplierPurchaseOrdersService],
    }).compile();

    service = module.get<SupplierPurchaseOrdersService>(SupplierPurchaseOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
