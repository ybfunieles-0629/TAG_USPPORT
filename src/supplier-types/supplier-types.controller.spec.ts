import { Test, TestingModule } from '@nestjs/testing';
import { SupplierTypesController } from './supplier-types.controller';
import { SupplierTypesService } from './supplier-types.service';

describe('SupplierTypesController', () => {
  let controller: SupplierTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierTypesController],
      providers: [SupplierTypesService],
    }).compile();

    controller = module.get<SupplierTypesController>(SupplierTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
