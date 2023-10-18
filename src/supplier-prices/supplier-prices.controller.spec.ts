import { Test, TestingModule } from '@nestjs/testing';
import { SupplierPricesController } from './supplier-prices.controller';
import { SupplierPricesService } from './supplier-prices.service';

describe('SupplierPricesController', () => {
  let controller: SupplierPricesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierPricesController],
      providers: [SupplierPricesService],
    }).compile();

    controller = module.get<SupplierPricesController>(SupplierPricesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
