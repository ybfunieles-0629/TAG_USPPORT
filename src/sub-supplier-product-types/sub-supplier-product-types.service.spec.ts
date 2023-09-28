import { Test, TestingModule } from '@nestjs/testing';
import { SubSupplierProductTypesService } from './sub-supplier-product-types.service';

describe('SubSupplierProductTypesService', () => {
  let service: SubSupplierProductTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubSupplierProductTypesService],
    }).compile();

    service = module.get<SubSupplierProductTypesService>(SubSupplierProductTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
