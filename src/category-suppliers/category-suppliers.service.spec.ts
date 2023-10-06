import { Test, TestingModule } from '@nestjs/testing';
import { CategorySuppliersService } from './category-suppliers.service';

describe('CategorySuppliersService', () => {
  let service: CategorySuppliersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategorySuppliersService],
    }).compile();

    service = module.get<CategorySuppliersService>(CategorySuppliersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
