import { Test, TestingModule } from '@nestjs/testing';
import { SupplierPurchaseOrdersController } from './supplier-purchase-orders.controller';
import { SupplierPurchaseOrdersService } from './supplier-purchase-orders.service';

describe('SupplierPurchaseOrdersController', () => {
  let controller: SupplierPurchaseOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierPurchaseOrdersController],
      providers: [SupplierPurchaseOrdersService],
    }).compile();

    controller = module.get<SupplierPurchaseOrdersController>(SupplierPurchaseOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
