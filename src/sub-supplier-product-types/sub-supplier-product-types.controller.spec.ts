import { Test, TestingModule } from '@nestjs/testing';
import { SubSupplierProductTypesController } from './sub-supplier-product-types.controller';
import { SubSupplierProductTypesService } from './sub-supplier-product-types.service';

describe('SubSupplierProductTypesController', () => {
  let controller: SubSupplierProductTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubSupplierProductTypesController],
      providers: [SubSupplierProductTypesService],
    }).compile();

    controller = module.get<SubSupplierProductTypesController>(SubSupplierProductTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
