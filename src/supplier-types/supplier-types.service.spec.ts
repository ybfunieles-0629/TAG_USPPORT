import { Test, TestingModule } from '@nestjs/testing';
import { SupplierTypesService } from './supplier-types.service';

describe('SupplierTypesService', () => {
  let service: SupplierTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupplierTypesService],
    }).compile();

    service = module.get<SupplierTypesService>(SupplierTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
